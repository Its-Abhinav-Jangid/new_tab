import { useState, useMemo, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import {
  fetchH1Reports,
  parseH1Csv,
  calculateH1Stats,
  formatBounty,
} from "../services/hackeroneApi";
import H1ReportModal from "./H1ReportModal";
import {
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  ExternalLink,
  Pencil,
  Trash2,
  DollarSign,
  CheckCircle2,
  Clock,
  Upload,
  Download,
  AlertCircle,
  Key,
} from "lucide-react";
import "./H1ReportsTracker.css";

const SAMPLE_REPORTS = [
  {
    id: "2498101",
    title: "Server-Side Request Forgery (SSRF) in webhook avatar validator",
    program: "shopify",
    state: "resolved",
    severity: "critical",
    bounty: 5000,
    currency: "USD",
    url: "https://hackerone.com/reports/2498101",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    source: "manual",
  },
  {
    id: "2471203",
    title: "IDOR allows unauthorized account takeover via GraphQL mutation",
    program: "gitlab",
    state: "triaged",
    severity: "high",
    bounty: 3000,
    currency: "USD",
    url: "https://hackerone.com/reports/2471203",
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    source: "manual",
  },
  {
    id: "2445892",
    title: "Stored XSS in user profile biography via bypass of sanitizer",
    program: "us-dod",
    state: "triaged",
    severity: "medium",
    bounty: null,
    currency: "USD",
    url: "https://hackerone.com/reports/2445892",
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    source: "manual",
  },
  {
    id: "2419088",
    title: "Race condition in password reset token redemption",
    program: "uber",
    state: "duplicate",
    severity: "high",
    bounty: null,
    currency: "USD",
    url: "https://hackerone.com/reports/2419088",
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    source: "manual",
  },
];

const SEVERITY_COLORS = {
  critical: {
    bg: "rgba(247, 118, 142, 0.15)",
    text: "#f7768e",
    border: "rgba(247, 118, 142, 0.4)",
  },
  high: {
    bg: "rgba(255, 158, 100, 0.15)",
    text: "#ff9e64",
    border: "rgba(255, 158, 100, 0.4)",
  },
  medium: {
    bg: "rgba(224, 175, 104, 0.15)",
    text: "#e0af68",
    border: "rgba(224, 175, 104, 0.4)",
  },
  low: {
    bg: "rgba(122, 162, 247, 0.15)",
    text: "#7aa2f7",
    border: "rgba(122, 162, 247, 0.4)",
  },
  none: {
    bg: "rgba(86, 95, 137, 0.2)",
    text: "#a9b1d6",
    border: "rgba(86, 95, 137, 0.4)",
  },
};

const STATE_CONFIG = {
  resolved: {
    label: "Resolved",
    color: "#39d353",
    bg: "rgba(57, 211, 83, 0.12)",
  },
  triaged: {
    label: "Triaged",
    color: "#7dcfff",
    bg: "rgba(125, 207, 255, 0.12)",
  },
  new: { label: "New", color: "#bb9af7", bg: "rgba(187, 154, 247, 0.12)" },
  "needs-more-info": {
    label: "Needs Info",
    color: "#e0af68",
    bg: "rgba(224, 175, 104, 0.12)",
  },
  duplicate: {
    label: "Duplicate",
    color: "#565f89",
    bg: "rgba(86, 95, 137, 0.2)",
  },
  informative: {
    label: "Informative",
    color: "#7aa2f7",
    bg: "rgba(122, 162, 247, 0.12)",
  },
  "not-applicable": {
    label: "N/A",
    color: "#565f89",
    bg: "rgba(86, 95, 137, 0.2)",
  },
  spam: { label: "Spam", color: "#f7768e", bg: "rgba(247, 118, 142, 0.12)" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const timestamp = new Date(dateStr).getTime();
  if (isNaN(timestamp)) return "";
  const diff = (Date.now() - timestamp) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (86400 * 30))}mo ago`;
}

export default function H1ReportsTracker({ onOpenSettings }) {
  const [settings, updateSetting] = useSettings();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // 'date' | 'bounty' | 'severity'
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const fileInputRef = useRef(null);

  const reports = useMemo(() => settings.h1Reports || [], [settings.h1Reports]);
  const stats = useMemo(() => calculateH1Stats(reports), [reports]);

  // Sync API reports
  const handleSyncApi = async () => {
    if (!settings.h1Identifier || !settings.h1Token) {
      setSyncFeedback({
        type: "warn",
        message:
          "API identifier or token missing. Please configure credentials in Settings.",
      });
      return;
    }

    setSyncing(true);
    setSyncFeedback(null);

    const res = await fetchH1Reports({
      identifier: settings.h1Identifier,
      token: settings.h1Token,
      corsProvider: settings.h1CorsProvider || "corsproxy.io",
      corsApiKey: settings.h1CorsApiKey || "",
      customProxyUrl: settings.h1CustomProxyUrl || settings.h1ProxyUrl || "",
      customHeaderName: settings.h1CustomHeaderName || "",
      customHeaderValue: settings.h1CustomHeaderValue || "",
    });

    setSyncing(false);

    if (res.success) {
      // Merge: preserve manual edits/reports while updating API reports
      const existingManual = reports.filter((r) => r.source === "manual");
      const apiIds = new Set(res.reports.map((r) => r.id));
      const filteredManual = existingManual.filter((r) => !apiIds.has(r.id));
      const combined = [...res.reports, ...filteredManual];

      updateSetting("h1Reports", combined);
      updateSetting("h1LastSync", new Date().toISOString());
      updateSetting("h1SyncError", null);
      setSyncFeedback({
        type: "success",
        message: `Synced ${res.reports.length} report${res.reports.length !== 1 ? "s" : ""} from HackerOne.`,
      });
    } else {
      updateSetting("h1SyncError", res.error);
      setSyncFeedback({
        type: "error",
        message: res.error,
        isCors: res.isCors,
      });
    }
  };

  // Save (add or edit) report
  const handleSaveReport = (report) => {
    const existingIndex = reports.findIndex((r) => r.id === report.id);
    let nextReports;
    if (existingIndex >= 0) {
      nextReports = [...reports];
      nextReports[existingIndex] = report;
    } else {
      nextReports = [report, ...reports];
    }
    updateSetting("h1Reports", nextReports);
  };

  // Remove report
  const handleDeleteReport = (id) => {
    const nextReports = reports.filter((r) => r.id !== id);
    updateSetting("h1Reports", nextReports);
  };

  // Import CSV from HackerOne export
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const parsed = parseH1Csv(text);
        if (parsed.length === 0) {
          setSyncFeedback({
            type: "error",
            message: "No valid reports found in the uploaded CSV.",
          });
          return;
        }

        // Merge imported reports with existing by ID
        const existingMap = new Map(reports.map((r) => [r.id, r]));
        parsed.forEach((r) => existingMap.set(r.id, r));
        const merged = Array.from(existingMap.values());

        updateSetting("h1Reports", merged);
        setSyncFeedback({
          type: "success",
          message: `Imported ${parsed.length} reports successfully from CSV.`,
        });
      } catch (err) {
        setSyncFeedback({
          type: "error",
          message: `Failed to parse CSV: ${err.message}`,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Export reports to JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(reports, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `hackerone_reports_${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Populate sample demo data
  const handleLoadSamples = () => {
    updateSetting("h1Reports", SAMPLE_REPORTS);
    setSyncFeedback({
      type: "success",
      message: "Sample reports loaded.",
    });
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => {
        if (stateFilter !== "all" && r.state !== stateFilter) return false;
        if (severityFilter !== "all" && r.severity !== severityFilter)
          return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (r.title || "").toLowerCase().includes(q);
          const matchProg = (r.program || "").toLowerCase().includes(q);
          const matchId = (r.id || "").toLowerCase().includes(q);
          if (!matchTitle && !matchProg && !matchId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "bounty") {
          return (b.bounty || 0) - (a.bounty || 0);
        }
        if (sortBy === "severity") {
          const weights = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
          return (weights[b.severity] || 0) - (weights[a.severity] || 0);
        }
        // default: newest date
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });
  }, [reports, stateFilter, severityFilter, searchQuery, sortBy]);

  return (
    <div className="h1-tracker">
      {/* Tracker Top Banner */}
      <div className="h1-top-banner">
        <div className="h1-top-title-wrap">
          <ShieldAlert size={15} className="h1-accent-icon" />
          <h2 className="h1-top-title">
            <span className="h1-title-main">// hackerone reports</span>
            <span className="h1-title-sub">
              {" "}
              · track targets, triage & bounty earnings
            </span>
          </h2>
        </div>

        <div className="h1-top-actions">
          {settings.h1LastSync && (
            <span className="h1-last-sync" title={settings.h1LastSync}>
              <Clock size={11} />
              <span>Synced {timeAgo(settings.h1LastSync)}</span>
            </span>
          )}

          <button
            type="button"
            className={`h1-action-btn h1-sync-btn ${syncing ? "syncing" : ""}`}
            onClick={handleSyncApi}
            disabled={syncing}
            title="Fetch latest reports from HackerOne API"
          >
            <RefreshCw size={12} className={syncing ? "spin" : ""} />
            <span>{syncing ? "Syncing..." : "Sync API"}</span>
          </button>

          <button
            type="button"
            className="h1-action-btn h1-log-btn"
            onClick={() => {
              setEditingReport(null);
              setModalOpen(true);
            }}
          >
            <Plus size={13} />
            <span>Log Report</span>
          </button>

          <button
            type="button"
            className="h1-action-btn h1-icon-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Import HackerOne CSV export"
          >
            <Upload size={13} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            style={{ display: "none" }}
          />

          {reports.length > 0 && (
            <button
              type="button"
              className="h1-action-btn h1-icon-btn"
              onClick={handleExportJson}
              title="Export reports as JSON"
            >
              <Download size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className={`h1-feedback-banner ${syncFeedback.type}`}>
          <div className="h1-feedback-content">
            {syncFeedback.type === "success" && <CheckCircle2 size={14} />}
            {syncFeedback.type === "warn" && <AlertCircle size={14} />}
            {syncFeedback.type === "error" && <AlertCircle size={14} />}
            <span>{syncFeedback.message}</span>
          </div>

          <div className="h1-feedback-actions">
            {syncFeedback.type === "warn" && onOpenSettings && (
              <button
                type="button"
                className="h1-feedback-btn"
                onClick={onOpenSettings}
              >
                Open Settings
              </button>
            )}
            <button
              type="button"
              className="h1-feedback-close"
              onClick={() => setSyncFeedback(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="h1-stats-grid">
        <div className="h1-stat-card">
          <div className="h1-stat-label">Total Reports</div>
          <div className="h1-stat-value">{stats.total}</div>
          <div className="h1-stat-sub">submitted submissions</div>
        </div>

        <div className="h1-stat-card">
          <div className="h1-stat-label">Triaged / In Progress</div>
          <div className="h1-stat-value text-cyan">{stats.triagedCount}</div>
          <div className="h1-stat-sub">awaiting resolution / fix</div>
        </div>

        <div className="h1-stat-card">
          <div className="h1-stat-label">Resolved</div>
          <div className="h1-stat-value text-green">{stats.resolvedCount}</div>
          <div className="h1-stat-sub">fixed & confirmed bugs</div>
        </div>

        <div className="h1-stat-card">
          <div className="h1-stat-label">Duplicates</div>
          <div className="h1-stat-value text-dupe">{stats.duplicateCount}</div>
          <div className="h1-stat-sub">the classic "already reported"</div>
        </div>

        <div className="h1-stat-card h1-stat-bounty">
          <div className="h1-stat-label">Total Bounties Earned</div>
          <div className="h1-stat-value text-gold">
            {formatBounty(stats.totalBounties)}
          </div>
          <div className="h1-stat-sub">cumulative payout reward</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="h1-controls-bar">
        {/* Search */}
        <div className="h1-search-wrap">
          <Search size={13} className="h1-search-icon" />
          <input
            type="text"
            className="h1-search-input"
            placeholder="Search report #, title, or target program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="h1-search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* State filters */}
        <div className="h1-filter-tabs">
          {[
            { id: "all", label: "All States" },
            { id: "triaged", label: "Triaged" },
            { id: "resolved", label: "Resolved" },
            { id: "duplicate", label: "Dupes" },
            { id: "new", label: "New" },
            { id: "needs-more-info", label: "Needs Info" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              className={`h1-filter-tab ${stateFilter === st.id ? "active" : ""}`}
              onClick={() => setStateFilter(st.id)}
            >
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* Sort & Severity Dropdowns */}
        <div className="h1-dropdowns-wrap">
          <select
            className="h1-dropdown-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            aria-label="Filter by severity"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None / Info</option>
          </select>

          <select
            className="h1-dropdown-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort reports"
          >
            <option value="date">Sort: Newest</option>
            <option value="bounty">Sort: Highest Bounty</option>
            <option value="severity">Sort: Highest Severity</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="h1-reports-grid">
          {filteredReports.map((report) => {
            const sevConfig =
              SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.none;
            const stateCfg = STATE_CONFIG[report.state] || {
              label: report.state,
              color: "#a9b1d6",
              bg: "rgba(169, 177, 214, 0.12)",
            };

            return (
              <div key={report.id} className="h1-report-card">
                {/* Card Top: Program, ID, Severity, State */}
                <div className="h1-card-header">
                  <div className="h1-card-program-wrap">
                    <span className="h1-program-badge">
                      @{report.program || "unknown"}
                    </span>
                    <a
                      href={
                        report.url ||
                        `https://hackerone.com/reports/${report.id}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h1-report-id-link"
                      title="Open on HackerOne"
                    >
                      <span>#{report.id}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="h1-card-badges">
                    <span
                      className="h1-severity-pill"
                      style={{
                        backgroundColor: sevConfig.bg,
                        color: sevConfig.text,
                        borderColor: sevConfig.border,
                      }}
                    >
                      {report.severity || "none"}
                    </span>
                    <span
                      className="h1-state-pill"
                      style={{
                        backgroundColor: stateCfg.bg,
                        color: stateCfg.color,
                      }}
                    >
                      {stateCfg.label}
                    </span>
                  </div>
                </div>

                {/* Card Title */}
                <a
                  href={
                    report.url || `https://hackerone.com/reports/${report.id}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h1-card-title"
                >
                  {report.title}
                </a>

                {/* Card Footer: Bounty & Time & Actions */}
                <div className="h1-card-footer">
                  <div className="h1-card-bounty-wrap">
                    {report.bounty !== null &&
                    report.bounty !== undefined &&
                    report.bounty > 0 ? (
                      <span className="h1-bounty-reward">
                        <DollarSign size={12} />
                        <span>
                          {formatBounty(report.bounty, report.currency)}
                        </span>
                      </span>
                    ) : (
                      <span className="h1-bounty-pending">
                        {"// bounty pending / swag"}
                      </span>
                    )}
                  </div>

                  <div className="h1-card-actions">
                    <span className="h1-card-time" title={report.createdAt}>
                      {timeAgo(report.createdAt)}
                    </span>

                    <button
                      type="button"
                      className="h1-card-action-btn"
                      title="Edit report"
                      onClick={() => {
                        setEditingReport(report);
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={11} />
                    </button>

                    <button
                      type="button"
                      className="h1-card-action-btn delete"
                      title="Delete report"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Zero state */
        <div className="h1-empty-state">
          <div className="h1-empty-icon-wrap">
            <ShieldAlert size={28} />
          </div>

          <h3 className="h1-empty-title">
            {reports.length === 0
              ? "Track your HackerOne submissions"
              : "No reports match your active filters"}
          </h3>

          <p className="h1-empty-text">
            {reports.length === 0
              ? "Connect your HackerOne API token to automatically sync your submitted bug bounty reports, triaged vulnerabilities, and earned payouts."
              : "Try adjusting your search query, state, or severity filters to find matching vulnerability reports."}
          </p>

          {reports.length === 0 && (
            <div className="h1-empty-buttons">
              <button
                type="button"
                className="h1-btn-primary"
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                }}
              >
                <Key size={14} />
                <span>Configure HackerOne API</span>
              </button>

              <button
                type="button"
                className="h1-btn-secondary"
                onClick={() => {
                  setEditingReport(null);
                  setModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Log First Report</span>
              </button>

              <button
                type="button"
                className="h1-btn-ghost"
                onClick={handleLoadSamples}
              >
                <span>Load Sample Data</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Report Modal */}
      <H1ReportModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
        initialReport={editingReport}
      />
    </div>
  );
}
