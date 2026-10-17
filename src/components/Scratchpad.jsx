import { useState, useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import {
  FileText,
  Copy,
  Check,
  Trash2,
  Clock,
  Download,
  X,
} from "lucide-react";
import "./Scratchpad.css";

const STORAGE_KEY = "hacker_tab_scratchpad";

export default function Scratchpad({ isOpen, onClose, onContentChange }) {
  const { settings } = useSettings();
  const [content, setContent] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const textareaRef = useRef(null);

  // Check if scratchpad is enabled in user settings
  const isEnabled = settings?.showScratchpad ?? true;

  // Auto-focus textarea when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle global Escape key to close scratchpad
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Persist content to localStorage and notify parent
  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus("saving...");
    try {
      localStorage.setItem(STORAGE_KEY, val);
      setTimeout(() => setSaveStatus("saved"), 300);
    } catch (err) {
      console.warn("Unable to save scratchpad to localStorage:", err);
    }
    onContentChange?.(Boolean(val.trim()));
  };

  // Support Tab key in textarea to insert 2 spaces
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      const newVal = val.substring(0, start) + "  " + val.substring(end);
      setContent(newVal);
      try {
        localStorage.setItem(STORAGE_KEY, newVal);
      } catch {}
      onContentChange?.(Boolean(newVal.trim()));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Insert current timestamp [YYYY-MM-DD HH:mm]
  const handleInsertTimestamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `[${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}] `;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? content.length;
      const end = textarea.selectionEnd ?? content.length;
      const updated = content.slice(0, start) + stamp + content.slice(end);
      setContent(updated);
      try {
        localStorage.setItem(STORAGE_KEY, updated);
      } catch {}
      onContentChange?.(Boolean(updated.trim()));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + stamp.length;
      }, 0);
    } else {
      const updated = (content ? content + "\n" : "") + stamp;
      setContent(updated);
      try {
        localStorage.setItem(STORAGE_KEY, updated);
      } catch {}
      onContentChange?.(Boolean(updated.trim()));
    }
  };

  // Copy content to clipboard
  const handleCopy = async () => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    }
  };

  // Download content as a .txt file
  const handleDownload = () => {
    if (!content.trim()) return;
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scratchpad-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Download failed:", err);
    }
  };

  // Clear scratchpad
  const handleClear = () => {
    if (!content) return;
    if (content.length > 50 && !window.confirm("Clear scratchpad contents?")) {
      return;
    }
    setContent("");
    try {
      localStorage.setItem(STORAGE_KEY, "");
    } catch {}
    onContentChange?.(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  if (!isEnabled || !isOpen) return null;

  const lines = content ? content.split("\n") : [];
  const lineCount = content ? lines.length : 0;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <>
      {/* Backdrop */}
      <div className="sp-backdrop" onClick={onClose} />

      {/* Slide-out Drawer */}
      <aside
        className="sp-drawer"
        role="dialog"
        aria-label="Scratchpad notes buffer"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sp-header">
          <div className="sp-header-left">
            <FileText size={15} className="sp-header-icon" />
            <span className="sp-title">{"// scratchpad.txt"}</span>
            <span className={`sp-status ${saveStatus}`}>
              {saveStatus === "saved" ? "● saved" : "○ saving..."}
            </span>
          </div>

          <div className="sp-header-actions">
            <button
              type="button"
              className="sp-btn"
              onClick={handleInsertTimestamp}
              title="Insert timestamp"
            >
              <Clock size={12} />
              <span>Time</span>
            </button>

            {content && (
              <>
                <button
                  type="button"
                  className="sp-btn"
                  onClick={handleCopy}
                  title="Copy contents"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="sp-copied" />
                      <span className="sp-copied">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="sp-btn sp-btn-icon-only"
                  onClick={handleDownload}
                  title="Export as scratchpad.txt"
                >
                  <Download size={12} />
                </button>

                <button
                  type="button"
                  className="sp-btn sp-btn-icon-only"
                  onClick={handleClear}
                  title="Clear scratchpad"
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}

            <button
              type="button"
              className="sp-close-btn"
              onClick={onClose}
              title="Close (Esc)"
              aria-label="Close scratchpad"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Text editor body */}
        <div className="sp-body">
          <textarea
            ref={textareaRef}
            className="sp-textarea"
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`// scratchpad.txt · local memory buffer\n// paste commands, targets, hashes, api keys, payloads, todo list...\n// auto-saves in browser · Press Esc or click outside to dismiss`}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>

        {/* Footer */}
        <div className="sp-footer">
          <span className="sp-stats">
            {lineCount} {lineCount === 1 ? "line" : "lines"} · {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
          </span>
          <span className="sp-hint">
            <kbd className="sp-kbd">Alt+N</kbd> toggle · <kbd className="sp-kbd">Esc</kbd> close
          </span>
        </div>
      </aside>
    </>
  );
}
