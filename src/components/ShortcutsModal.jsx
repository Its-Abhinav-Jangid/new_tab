import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Command, Search, Bookmark, FileText, Settings as SettingsIcon } from "lucide-react";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import "./ShortcutsModal.css";

const SHORTCUT_GROUPS = [
  {
    category: "Navigation & Search",
    icon: Search,
    shortcuts: [
      { keys: ["/"], label: "Focus search bar" },
      { keys: ["Ctrl", "K"], label: "Focus search bar" },
      { keys: ["Tab"], label: "Cycle search engines (when empty) / autocomplete" },
      { keys: ["Alt", "1–4"], label: "Select Google / DuckDuckGo / Shodan / GitHub" },
      { keys: ["↑", "↓"], label: "Navigate search results & matching bookmarks" },
      { keys: ["Enter"], label: "Execute search or launch highlighted bookmark" },
      { keys: ["Alt", "R"], label: "Toggle Security Feed vs HackerOne Reports" },
      { keys: ["R"], label: "Toggle Security Feed vs HackerOne Reports (when not in search)" },
    ],
  },
  {
    category: "Bookmarks & Stash",
    icon: Bookmark,
    shortcuts: [
      { keys: ["Alt", "B"], label: "Quick add bookmark (works in search bar)" },
      { keys: ["B"], label: "Quick add bookmark (when not in search)" },
      { keys: ["bm <url>"], label: "Stash directly from search bar" },
    ],
  },
  {
    category: "Notes & Buffer",
    icon: FileText,
    shortcuts: [
      { keys: ["Alt", "N"], label: "Toggle scratchpad (works in search bar)" },
      { keys: ["N"], label: "Toggle scratchpad (when not in search)" },
      { keys: ["Esc"], label: "Close scratchpad / active drawer / modal" },
    ],
  },
  {
    category: "System & Settings",
    icon: SettingsIcon,
    shortcuts: [
      { keys: ["Alt", ","], label: "Toggle Settings drawer (works in search bar)" },
      { keys: [","], label: "Toggle Settings drawer (when not in search)" },
      { keys: ["Alt", "?"], label: "Toggle shortcuts cheat sheet (works in search bar)" },
      { keys: ["?"], label: "Toggle shortcuts cheat sheet (when not in search)" },
      { keys: ["Esc"], label: "Close active modal, drawer, or dropdown" },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  useLockBodyScroll(isOpen);

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

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="shortcuts-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="shortcuts-card" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="shortcuts-title-wrap">
            <span className="shortcuts-icon-badge" aria-hidden="true">
              <Command size={16} />
            </span>
            <div>
              <h3 id="shortcuts-title" className="shortcuts-title">
                Keyboard Shortcuts
              </h3>
              <span className="shortcuts-subtitle">
                {"// power user keybindings · press ? or Esc to close"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="shortcuts-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="shortcuts-grid">
          {SHORTCUT_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.category} className="shortcuts-group">
                <div className="shortcuts-group-title">
                  <GroupIcon size={13} />
                  <span>{group.category}</span>
                </div>
                <ul className="shortcuts-list">
                  {group.shortcuts.map((sc, idx) => (
                    <li key={idx} className="shortcuts-item">
                      <span className="shortcuts-label">{sc.label}</span>
                      <span className="shortcuts-keys">
                        {sc.keys.map((k, kIdx) => (
                          <kbd key={kIdx} className="shortcuts-kbd">
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="shortcuts-footer">
          <span>{"// navigate fast without touching the mouse"}</span>
          <button type="button" className="shortcuts-done-btn" onClick={onClose}>
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}

