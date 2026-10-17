/**
 * HackerOne API Service & Report Utilities
 *
 * Handles:
 * 1. Fetching reports from HackerOne Hacker API: GET https://api.hackerone.com/v1/hackers/me/reports
 * 2. Normalizing JSON-API format into app report format
 * 3. Parsing HackerOne exported CSV files (from hackerone.com/bugs)
 * 4. Calculating bounty totals and statistics
 */

const H1_API_BASE = "https://api.hackerone.com/v1/hackers/me/reports";

/**
 * Normalizes a HackerOne API report object into HackerTab format
 */
export function normalizeH1Report(rawReport) {
  if (!rawReport) return null;

  const id = String(rawReport.id || "");
  const attrs = rawReport.attributes || {};
  const rels = rawReport.relationships || {};

  // Extract program handle / name
  let program = "unknown";
  if (rels.program?.data?.attributes?.handle) {
    program = rels.program.data.attributes.handle;
  } else if (rels.program?.data?.attributes?.name) {
    program = rels.program.data.attributes.name;
  } else if (attrs.program_name) {
    program = attrs.program_name;
  }

  // Extract bounty amount if awarded
  let bounty = null;
  if (typeof attrs.bounty_amount === "number") {
    bounty = attrs.bounty_amount;
  } else if (attrs.bounty_amount && !isNaN(Number(attrs.bounty_amount))) {
    bounty = Number(attrs.bounty_amount);
  } else if (Array.isArray(rels.bounties?.data) && rels.bounties.data.length > 0) {
    const firstBounty = rels.bounties.data[0];
    const amount = firstBounty?.attributes?.amount;
    if (amount && !isNaN(Number(amount))) {
      bounty = Number(amount);
    }
  }

  // State & Substate normalization
  const state = (attrs.substate || attrs.state || "new").toLowerCase();

  // Severity normalization
  const severity = (attrs.severity_rating || attrs.severity || "none").toLowerCase();

  return {
    id: id || String(Date.now()),
    title: attrs.title || `Vulnerability Report #${id}`,
    program: program,
    state: state, // e.g. "triaged", "resolved", "needs-more-info", "new", "duplicate", "informative", "not-applicable"
    severity: severity, // "critical", "high", "medium", "low", "none"
    bounty: bounty,
    currency: attrs.currency || "USD",
    url: attrs.url || (id ? `https://hackerone.com/reports/${id}` : ""),
    createdAt: attrs.created_at || new Date().toISOString(),
    updatedAt: attrs.last_program_activity_at || attrs.updated_at || attrs.created_at || new Date().toISOString(),
    triagedAt: attrs.triaged_at || null,
    closedAt: attrs.closed_at || null,
    source: "api",
  };
}

export const CORS_PROVIDERS = [
  {
    id: "corsproxy.io",
    name: "corsproxy.io (Standard)",
    description: "Global edge CORS proxy. Requires a free or paid API key.",
    urlDoc: "https://console.corsproxy.io/",
    keyPlaceholder: "Enter your corsproxy.io API key...",
  },
  {
    id: "cors.sh",
    name: "cors.sh (Edge Proxy)",
    description: "Cloudflare edge CORS proxy with origin-pinned keys.",
    urlDoc: "https://cors.sh/",
    keyPlaceholder: "live_... or test_... API key",
  },
  {
    id: "custom",
    name: "Custom Proxy (Cloudflare Worker / Self-hosted)",
    description: "Your own CORS proxy endpoint (e.g. Cloudflare Worker).",
    urlDoc: null,
  },
  {
    id: "direct",
    name: "Direct (Browser Extension / No Proxy)",
    description: "Direct request to api.hackerone.com without proxy (requires extension host permissions).",
    urlDoc: null,
  },
];

/**
 * Fetch reports from HackerOne API using HTTP Basic Authentication & CORS provider
 */
export async function fetchH1Reports({
  identifier,
  token,
  corsProvider = "corsproxy.io",
  corsApiKey = "",
  customProxyUrl = "",
  customHeaderName = "",
  customHeaderValue = "",
  // Backwards compatibility with single proxyUrl
  proxyUrl = "",
}) {
  if (!identifier || !token) {
    return {
      success: false,
      error: "Missing HackerOne API identifier or token. Please configure them in Settings.",
    };
  }

  // Hacker API endpoint
  const targetUrl = `${H1_API_BASE}?page[size]=100`;
  const credentials = btoa(`${identifier.trim()}:${token.trim()}`);

  const headers = {
    Accept: "application/json",
    Authorization: `Basic ${credentials}`,
  };

  let urlToFetch = targetUrl;
  const effectiveProvider = corsProvider || "corsproxy.io";

  if (effectiveProvider === "corsproxy.io") {
    const key = (corsApiKey || "").trim();
    if (key) {
      urlToFetch = `https://corsproxy.io/?key=${encodeURIComponent(key)}&url=${encodeURIComponent(targetUrl)}`;
      headers["x-cors-api-key"] = key;
    } else {
      urlToFetch = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
    }
  } else if (effectiveProvider === "cors.sh") {
    urlToFetch = `https://proxy.cors.sh/${targetUrl}`;
    const key = (corsApiKey || "").trim();
    if (key) {
      headers["x-cors-api-key"] = key;
    }
  } else if (effectiveProvider === "custom") {
    const rawProxy = (customProxyUrl || proxyUrl || "").trim();
    if (rawProxy) {
      urlToFetch = rawProxy.includes("?")
        ? `${rawProxy}${encodeURIComponent(targetUrl)}`
        : `${rawProxy.replace(/\/$/, "")}/${targetUrl}`;

      if (customHeaderName?.trim() && customHeaderValue?.trim()) {
        headers[customHeaderName.trim()] = customHeaderValue.trim();
      }
    }
  } else if (effectiveProvider === "direct") {
    urlToFetch = targetUrl;
  }

  try {
    const response = await fetch(urlToFetch, {
      method: "GET",
      headers,
    });

    if (response.status === 401) {
      return {
        success: false,
        error: "401 Unauthorized: Invalid API Token Identifier or Token. Check your HackerOne API settings.",
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        error: "403 Forbidden: Your token lacks permissions to read hacker reports.",
      };
    }

    if (!response.ok) {
      let extra = "";
      try {
        const errJson = await response.json();
        if (errJson?.error) extra = ` (${errJson.error})`;
        else if (errJson?.message) extra = ` (${errJson.message})`;
      } catch {}
      return {
        success: false,
        error: `Proxy / API error (HTTP ${response.status}): ${response.statusText}${extra}`,
      };
    }

    const json = await response.json();
    const data = Array.isArray(json.data) ? json.data : [];
    const normalized = data.map(normalizeH1Report).filter(Boolean);

    return {
      success: true,
      reports: normalized,
      totalCount: normalized.length,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    // If standard fetch fails due to CORS in non-extension web mode
    const isCors =
      err.name === "TypeError" &&
      (err.message.includes("fetch") ||
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError"));

    if (isCors) {
      return {
        success: false,
        isCors: true,
        error:
          "CORS Policy Block: Direct browser requests to api.hackerone.com are blocked by CORS. In Settings → HackerOne, select a CORS provider (corsproxy.io or cors.sh) and enter your API key, or use a custom proxy.",
      };
    }

    return {
      success: false,
      error: err.message || "Failed to connect to HackerOne API.",
    };
  }
}

/**
 * Parse exported CSV from HackerOne (from hackerone.com/bugs)
 */
export function parseH1Csv(csvText) {
  if (!csvText || typeof csvText !== "string") return [];

  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());

  const reports = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (!cols || cols.length === 0) continue;

    const row = {};
    header.forEach((key, idx) => {
      row[key] = cols[idx] !== undefined ? cols[idx].trim() : "";
    });

    const id = row["id"] || row["report id"] || row["report #"] || String(Date.now() + i);
    const title = row["title"] || row["report title"] || `Report #${id}`;
    const program = row["program"] || row["team"] || row["handle"] || "unknown";
    const state = (row["state"] || row["status"] || row["substate"] || "new").toLowerCase();
    const severity = (row["severity"] || row["severity rating"] || "none").toLowerCase();

    // Bounty parsing
    let bounty = null;
    const rawBounty = row["bounty"] || row["bounty amount"] || row["awarded"];
    if (rawBounty) {
      const cleanBounty = rawBounty.replace(/[^0-9.]/g, "");
      if (cleanBounty && !isNaN(Number(cleanBounty))) {
        bounty = Number(cleanBounty);
      }
    }

    const url = row["url"] || (id ? `https://hackerone.com/reports/${id}` : "");
    const createdAt = row["created at"] || row["submitted at"] || new Date().toISOString();

    reports.push({
      id: String(id),
      title,
      program,
      state,
      severity,
      bounty,
      currency: "USD",
      url,
      createdAt,
      updatedAt: row["updated at"] || createdAt,
      source: "csv",
    });
  }

  return reports;
}

/**
 * Helper to parse a single CSV line respecting quotes
 */
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Format currency amount cleanly (e.g. 1500 -> "$1,500")
 */
export function formatBounty(amount, currency = "USD") {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compute report analytics
 */
export function calculateH1Stats(reports = []) {
  let totalBounties = 0;
  let triagedCount = 0;
  let resolvedCount = 0;
  let pendingCount = 0;
  let duplicateCount = 0;
  let closedCount = 0;

  for (const r of reports) {
    if (typeof r.bounty === "number" && !isNaN(r.bounty)) {
      totalBounties += r.bounty;
    }

    const state = (r.state || "").toLowerCase();
    if (state === "resolved") {
      resolvedCount++;
    } else if (state === "triaged" || state === "pending") {
      triagedCount++;
    } else if (state === "new" || state === "needs-more-info") {
      pendingCount++;
    } else if (state === "duplicate" || state === "dupe") {
      duplicateCount++;
    } else if (["informative", "not-applicable", "spam", "closed"].includes(state)) {
      closedCount++;
    }
  }

  return {
    total: reports.length,
    totalBounties,
    triagedCount,
    resolvedCount,
    pendingCount,
    duplicateCount,
    closedCount,
  };
}

