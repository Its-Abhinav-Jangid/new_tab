import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import { X, ShieldAlert, Check, DollarSign } from "lucide-react";
import "./H1ReportModal.css";

const SEVERITIES = [
  { value: "critical", label: "Critical", color: "#f7768e" },
  { value: "high", label: "High", color: "#ff9e64" },
  { value: "medium", label: "Medium", color: "#e0af68" },
  { value: "low", label: "Low", color: "#7aa2f7" },
  { value: "none", label: "None / Info", color: "#7dcfff" },
];

const STATES = [
  { value: "new", label: "New (Submitted)" },
  { value: "triaged", label: "Triaged" },
  { value: "needs-more-info", label: "Needs More Info" },
  { value: "resolved", label: "Resolved" },
  { value: "duplicate", label: "Duplicate" },
  { value: "informative", label: "Informative" },
  { value: "not-applicable", label: "N/A" },
  { value: "spam", label: "Spam" },
];

export default function H1ReportModal({
  isOpen,
  onClose,
  onSave,
  initialReport = null,
}) {
  const [reportId, setReportId] = useState("");
  const [title, setTitle] = useState("");
  const [program, setProgram] = useState("");
  const [severity, setSeverity] = useState("high");
  const [state, setState] = useState("triaged");
  const [bounty, setBounty] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const idInputRef = useRef(null);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (initialReport) {
        setReportId(initialReport.id || "");
        setTitle(initialReport.title || "");
        setProgram(initialReport.program || "");
        setSeverity(initialReport.severity || "medium");
        setState(initialReport.state || "new");
        setBounty(
          initialReport.bounty !== null && initialReport.bounty !== undefined
            ? String(initialReport.bounty)
            : ""
        );
        setUrl(initialReport.url || "");
      } else {
        setReportId("");
        setTitle("");
        setProgram("");
        setSeverity("high");
        setState("triaged");
        setBounty("");
        setUrl("");
      }
      setError("");
      const timer = setTimeout(() => {
        idInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialReport]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = reportId.trim().replace(/^#/, "");
    const cleanTitle = title.trim();
    const cleanProgram = program.trim();

    if (!cleanTitle) {
      setError("Please provide a report title or vulnerability summary.");
      return;
    }

    const bountyNumber = bounty.trim() !== "" ? Number(bounty.replace(/[^0-9.]/g, "")) : null;

    const reportObj = {
      id: cleanId || String(Date.now()),
      title: cleanTitle,
      program: cleanProgram || "unknown",
      severity,
      state,
      bounty: !isNaN(bountyNumber) ? bountyNumber : null,
      currency: "USD",
      url: url.trim() || (cleanId ? `https://hackerone.com/reports/${cleanId}` : ""),
      createdAt: initialReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: initialReport?.source || "manual",
    };

    onSave(reportObj);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="h1-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="h1-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="h1-modal-header">
          <div className="h1-modal-title-wrap">
            <span className="h1-modal-icon-badge">
              <ShieldAlert size={16} />
            </span>
            <div>
              <h3 className="h1-modal-title">
                {initialReport ? "Edit Vulnerability Report" : "Log Vulnerability Report"}
              </h3>
              <span className="h1-modal-subtitle">
                {"// track target, triage progress, and bounties"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="h1-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="h1-modal-form">
          {error && <div className="h1-modal-error">{error}</div>}

          {/* Report ID & Target Program */}
          <div className="h1-form-row h1-form-row-2">
            <div className="h1-form-field">
              <label htmlFor="h1-report-id" className="h1-form-label">
                Report ID / #
              </label>
              <input
                id="h1-report-id"
                ref={idInputRef}
                type="text"
                className="h1-form-input"
                placeholder="e.g. 129329"
                value={reportId}
                onChange={(e) => {
                  const val = e.target.value;
                  setReportId(val);
                  if (val && !url) {
                    const clean = val.replace(/^#/, "").trim();
                    if (/^\d+$/.test(clean)) {
                      setUrl(`https://hackerone.com/reports/${clean}`);
                    }
                  }
                }}
              />
            </div>

            <div className="h1-form-field">
              <label htmlFor="h1-report-program" className="h1-form-label">
                Target / Program
              </label>
              <input
                id="h1-report-program"
                type="text"
                className="h1-form-input"
                placeholder="e.g. shopify, gitlab, us-dod"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
              />
            </div>
          </div>

          {/* Title */}
          <div className="h1-form-field">
            <label htmlFor="h1-report-title" className="h1-form-label">
              Vulnerability Title
            </label>
            <input
              id="h1-report-title"
              type="text"
              className="h1-form-input"
              placeholder="e.g. Blind SSRF via Webhook Validator"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          {/* Severity & State */}
          <div className="h1-form-row h1-form-row-2">
            <div className="h1-form-field">
              <label htmlFor="h1-report-severity" className="h1-form-label">
                Severity
              </label>
              <select
                id="h1-report-severity"
                className="h1-form-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h1-form-field">
              <label htmlFor="h1-report-state" className="h1-form-label">
                Status / State
              </label>
              <select
                id="h1-report-state"
                className="h1-form-select"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {STATES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bounty & Direct Link */}
          <div className="h1-form-row h1-form-row-2">
            <div className="h1-form-field">
              <label htmlFor="h1-report-bounty" className="h1-form-label">
                Bounty Awarded ($)
              </label>
              <div className="h1-input-with-icon">
                <DollarSign size={14} className="h1-input-lead-icon" />
                <input
                  id="h1-report-bounty"
                  type="text"
                  className="h1-form-input has-lead-icon"
                  placeholder="0 (or leave blank if pending)"
                  value={bounty}
                  onChange={(e) => setBounty(e.target.value)}
                />
              </div>
            </div>

            <div className="h1-form-field">
              <label htmlFor="h1-report-url" className="h1-form-label">
                Direct Report URL
              </label>
              <input
                id="h1-report-url"
                type="url"
                className="h1-form-input"
                placeholder="https://hackerone.com/reports/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="h1-modal-actions">
            <button
              type="button"
              className="h1-modal-btn h1-modal-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h1-modal-btn h1-modal-btn-primary"
            >
              <Check size={14} />
              <span>{initialReport ? "Update Report" : "Save Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

