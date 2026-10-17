/**
 * Utility helpers for bookmarks: URL parsing, validation, and auto-label generation.
 */

const KNOWN_NAMES = {
  "github.com": "GitHub",
  "gitlab.com": "GitLab",
  "hacktricks.xyz": "HackTricks",
  "book.hacktricks.xyz": "HackTricks",
  "portswigger.net": "PortSwigger",
  "gtfobins.github.io": "GTFOBins",
  "cvedetails.com": "CVE Details",
  "exploit-db.com": "ExploitDB",
  "shodan.io": "Shodan",
  "gchq.github.io": "CyberChef",
  "cyberchef.org": "CyberChef",
  "revshells.com": "RevShells",
  "reddit.com": "Reddit",
  "youtube.com": "YouTube",
  "twitter.com": "Twitter",
  "x.com": "X",
  "news.ycombinator.com": "Hacker News",
  "ycombinator.com": "Y Combinator",
  "infosecwriteups.com": "InfoSec Writeups",
  "intigriti.com": "Intigriti",
  "pentester.land": "Pentester Land",
  "google.com": "Google",
  "duckduckgo.com": "DuckDuckGo",
  "stackoverflow.com": "Stack Overflow",
  "wikipedia.org": "Wikipedia",
  "medium.com": "Medium",
  "discord.com": "Discord",
  "hackthebox.com": "Hack The Box",
  "tryhackme.com": "TryHackMe",
  "tldrsec.com": "tl;dr sec",
  "hackerone.com": "HackerOne",
  "bugcrowd.com": "Bugcrowd",
  "owasp.org": "OWASP",
};

/**
 * Normalizes URL with https:// protocol if not present
 */
export function formatBookmarkUrl(rawUrl) {
  if (!rawUrl) return "";
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Checks if raw input represents a valid URL or web domain
 */
export function isValidUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return false;
  try {
    const formatted = formatBookmarkUrl(rawUrl);
    const parsed = new URL(formatted);
    return Boolean(parsed.hostname && parsed.hostname.includes("."));
  } catch {
    return false;
  }
}

/**
 * Intelligently extracts a readable label/title from a URL or domain
 */
export function deriveLabelFromUrl(rawUrl) {
  if (!rawUrl || !rawUrl.trim()) return "";
  try {
    const formatted = formatBookmarkUrl(rawUrl);
    const parsed = new URL(formatted);
    let host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return "";

    if (KNOWN_NAMES[host]) return KNOWN_NAMES[host];

    // Check for common hosts with subdomains
    const parts = host.split(".");
    if (parts.length >= 2) {
      const skipPrefixes = new Set(["book", "app", "api", "docs", "m", "dev"]);
      const mainPart =
        parts.length > 2 && skipPrefixes.has(parts[0])
          ? parts[1]
          : parts[0];
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }
    return host;
  } catch {
    return rawUrl.trim();
  }
}

