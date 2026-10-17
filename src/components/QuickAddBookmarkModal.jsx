import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import BookmarkIcon, { AVAILABLE_BOOKMARK_ICONS } from "./BookmarkIcon";
import {
  deriveLabelFromUrl,
  formatBookmarkUrl,
  isValidUrl,
} from "../utils/bookmarkUtils";
import { Plus, X, Check, Link as LinkIcon, Pencil } from "lucide-react";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import "./QuickAddBookmarkModal.css";

const POPULAR_ICONS = [
  "favicon",
  "Terminal",
  "Shield",
  "Bug",
  "Flame",
  "Cpu",
  "Zap",
  "Globe",
  "Search",
  "Key",
  "Database",
  "Link",
];

export default function QuickAddBookmarkModal({
  isOpen,
  onClose,
  initialBookmark = null,
}) {
  const [settings, updateSetting] = useSettings();
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("favicon");
  const [error, setError] = useState("");
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [labelManuallyEdited, setLabelManuallyEdited] = useState(false);

  const urlInputRef = useRef(null);

  // Lock background scrolling while modal is open
  useLockBodyScroll(isOpen);

  // Focus input on open & populate if editing, or reset if new
  useEffect(() => {
    if (isOpen) {
      if (initialBookmark) {
        setUrl(initialBookmark.url || "");
        setLabel(initialBookmark.label || "");
        setIcon(initialBookmark.icon || "favicon");
        setLabelManuallyEdited(true);
      } else {
        setUrl("");
        setLabel("");
        setIcon("favicon");
        setLabelManuallyEdited(false);
      }
      setError("");
      setShowAllIcons(false);
      const timer = setTimeout(() => {
        urlInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialBookmark]);

  // Handle ESC key
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

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    setError("");

    // Auto-derive label if the user hasn't typed their own
    if (!labelManuallyEdited) {
      const derived = deriveLabelFromUrl(val);
      if (derived) {
        setLabel(derived);
      }
    }
  };

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
    setLabelManuallyEdited(true);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter a website URL.");
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError("Please enter a valid web address (e.g. github.com).");
      return;
    }

    const formattedUrl = formatBookmarkUrl(trimmedUrl);
    const finalLabel =
      label.trim() || deriveLabelFromUrl(formattedUrl) || "Link";

    const currentBookmarks = settings?.bookmarks || [];
    const isEditing = Boolean(initialBookmark);

    if (isEditing) {
      const updated = currentBookmarks.map((bm) =>
        (initialBookmark.id && bm.id === initialBookmark.id) ||
        bm.url === initialBookmark.url
          ? {
              ...bm,
              id: bm.id || initialBookmark.id || Date.now().toString(),
              label: finalLabel,
              url: formattedUrl,
              icon: icon || "favicon",
            }
          : bm
      );
      updateSetting("bookmarks", updated);
    } else {
      const newBookmark = {
        id: Date.now().toString(),
        label: finalLabel,
        url: formattedUrl,
        icon: icon || "favicon",
      };
      updateSetting("bookmarks", [...currentBookmarks, newBookmark]);
    }

    onClose();
  };

  if (!isOpen) return null;

  const iconsToDisplay = showAllIcons
    ? AVAILABLE_BOOKMARK_ICONS
    : POPULAR_ICONS;

  const formattedUrlPreview = url.trim() ? formatBookmarkUrl(url) : "";
  const isEditing = Boolean(initialBookmark);

  const modalContent = (
    <div
      className="quick-add-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      <div className="quick-add-card" onClick={(e) => e.stopPropagation()}>
        <div className="quick-add-header">
          <div className="quick-add-title-wrap">
            <span className="quick-add-icon-badge" aria-hidden="true">
              {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
            </span>
            <div>
              <h3 id="quick-add-title" className="quick-add-title">
                {isEditing ? "Edit Bookmark" : "Quick Add Bookmark"}
              </h3>
              <span className="quick-add-subtitle">
                {isEditing
                  ? "// update target parameters · enter to save"
                  : "// instant stash · enter to save"}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="quick-add-close"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quick-add-form">
          {error && <div className="quick-add-error">{`[!] ${error}`}</div>}

          {/* URL Input */}
          <div className="quick-add-field">
            <label htmlFor="quick-add-url" className="quick-add-label">
              URL / Target Address
            </label>
            <div className="quick-add-input-wrap">
              <span className="quick-add-input-icon-box">
                {formattedUrlPreview ? (
                  <BookmarkIcon
                    name={icon}
                    url={formattedUrlPreview}
                    size={15}
                  />
                ) : (
                  <LinkIcon size={14} />
                )}
              </span>
              <input
                id="quick-add-url"
                ref={urlInputRef}
                type="text"
                className="quick-add-input with-icon"
                value={url}
                onChange={handleUrlChange}
                placeholder="github.com, hacktricks.xyz, cve.org..."
                autoComplete="off"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Label Input */}
          <div className="quick-add-field">
            <div className="quick-add-label-row">
              <label htmlFor="quick-add-name" className="quick-add-label">
                Display Name
              </label>
              <span className="quick-add-hint">auto-derived or custom</span>
            </div>
            <input
              id="quick-add-name"
              type="text"
              className="quick-add-input"
              value={label}
              onChange={handleLabelChange}
              placeholder="e.g. GitHub, Exploit Database..."
              maxLength={30}
            />
          </div>

          {/* Icon Selector */}
          <div className="quick-add-field">
            <div className="quick-add-label-row">
              <label className="quick-add-label">Bookmark Icon</label>
              <span className="quick-add-hint">
                {icon === "favicon" ? "auto-fetched site favicon" : icon}
              </span>
            </div>
            <div className="quick-add-icons-grid">
              {iconsToDisplay.map((iconKey) => {
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    className={`quick-add-icon-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => setIcon(iconKey)}
                    title={iconKey === "favicon" ? "Website Favicon" : iconKey}
                  >
                    <BookmarkIcon
                      name={iconKey}
                      url={formattedUrlPreview || "https://google.com"}
                      size={15}
                    />
                  </button>
                );
              })}
            </div>
            {!showAllIcons && (
              <button
                type="button"
                className="quick-add-more-icons"
                onClick={() => setShowAllIcons(true)}
              >
                + more icons...
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="quick-add-actions">
            <button
              type="button"
              className="quick-add-btn-cancel"
              onClick={onClose}
            >
              Cancel (Esc)
            </button>
            <button type="submit" className="quick-add-btn-submit">
              <Check size={14} />
              <span>{isEditing ? "Save Changes (↵)" : "Stash Target (↵)"}</span>
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
