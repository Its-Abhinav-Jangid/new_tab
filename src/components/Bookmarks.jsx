import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import BookmarkIcon from "./BookmarkIcon";
import QuickAddBookmarkModal from "./QuickAddBookmarkModal";
import {
  Bookmark,
  ArrowRight,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import "./Bookmarks.css";

export default function Bookmarks() {
  const { settings, updateSetting } = useSettings();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [mobileActionBm, setMobileActionBm] = useState(null);

  // Lock background scrolling while mobile action sheet is active
  useLockBodyScroll(Boolean(mobileActionBm));

  const bookmarks = settings?.bookmarks || [];

  // Mobile long-press detection refs
  const longPressTimerRef = useRef(null);
  const longPressFiredRef = useRef(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  // Global keyboard shortcut: Press Alt+B (works in search bar) or B/+ (when not in an input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTextarea = tag === "textarea";
      const isInput =
        tag === "input" ||
        tag === "select" ||
        document.activeElement?.isContentEditable;

      const hasModifier = e.altKey || e.ctrlKey || e.metaKey;

      // Prefixed shortcut: Alt+B or Ctrl+B works everywhere, including when typing in search bar
      if (hasModifier && (e.key === "b" || e.key === "B")) {
        if (!quickAddOpen) {
          e.preventDefault();
          setEditingBookmark(null);
          setQuickAddOpen(true);
        }
        return;
      }

      // Unprefixed shortcut: B or + only when not in an input/textarea
      if (!isInput && !isTextarea) {
        if (e.key === "b" || e.key === "B" || e.key === "+") {
          e.preventDefault();
          setEditingBookmark(null);
          setQuickAddOpen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickAddOpen]);

  const handleOpenAdd = () => {
    setEditingBookmark(null);
    setQuickAddOpen(true);
  };

  const handleOpenEdit = (bm) => {
    setEditingBookmark(bm);
    setQuickAddOpen(true);
    setMobileActionBm(null);
  };

  const handleCloseModal = () => {
    setQuickAddOpen(false);
    setEditingBookmark(null);
  };

  const handleRemoveBookmark = (bmToRemove) => {
    const updated = bookmarks.filter((b) =>
      b.id ? b.id !== bmToRemove.id : b.url !== bmToRemove.url
    );
    updateSetting("bookmarks", updated);
  };

  // Mobile touch handlers for long-press
  const handleTouchStart = (e, bm) => {
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    longPressFiredRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore vibration restriction
        }
      }
      setMobileActionBm(bm);
    }, 450);
  };

  const handleTouchMove = (e) => {
    if (!longPressTimerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    // If finger moves more than 8px, cancel long-press to allow scrolling
    if (dx > 8 || dy > 8) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchEnd = (e) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (longPressFiredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFiredRef.current = false;
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressFiredRef.current = false;
  };

  const handleLinkClick = (e) => {
    if (longPressFiredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFiredRef.current = false;
    }
  };

  return (
    <>
      <div className="bookmarks">
        <div
          className="bookmarks-header"
          title="Essential targets & frequently visited rabbit holes"
        >
          <div className="bookmarks-header-left">
            <Bookmark size={12} className="bookmarks-header-icon" />
            <span>{"// quick links · digital stash"}</span>
          </div>
          <button
            type="button"
            className="bookmarks-quick-add-btn"
            onClick={handleOpenAdd}
            data-tooltip="Quick add (Alt+B)"
            title="Quick add bookmark (Press Alt+B or B)"
          >
            <Plus size={13} />
          </button>
        </div>
        <ul className="bookmarks-list">
          {bookmarks.map((bm) => (
            <li key={bm.id || bm.url} className="bookmark-list-item">
              <a
                className="bookmark-item"
                href={bm.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${bm.label} (${bm.url})`}
                onClick={handleLinkClick}
                onTouchStart={(e) => handleTouchStart(e, bm)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
              >
                <span className="bookmark-icon">
                  <BookmarkIcon name={bm.icon} url={bm.url} size={16} />
                </span>
                <span className="bookmark-label">{bm.label}</span>
                <span className="bookmark-arrow">
                  <ArrowRight size={13} />
                </span>
              </a>

              {/* Desktop hover actions: Edit & Delete */}
              <div className="bookmark-quick-actions">
                <button
                  type="button"
                  className="bookmark-action-btn bookmark-action-edit"
                  title={`Edit ${bm.label}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenEdit(bm);
                  }}
                >
                  <Pencil size={11} />
                </button>
                <button
                  type="button"
                  className="bookmark-action-btn bookmark-action-delete"
                  title={`Delete ${bm.label}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveBookmark(bm);
                  }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </li>
          ))}

          {/* Quick Add action item in list */}
          <li className="bookmark-add-item-wrap">
            <button
              type="button"
              className="bookmark-add-action-btn"
              onClick={handleOpenAdd}
              title="Add a new bookmark (Press Alt+B or B)"
            >
              <Plus size={13} />
              <span>Stash target</span>
              <kbd className="bookmark-kbd-hint">Alt+B</kbd>
            </button>
          </li>

          {bookmarks.length === 0 && (
            <li className="bookmarks-empty">
              <div className="bookmarks-empty-text">
                {"// 404 links found · digital stash is empty"}
              </div>
              <button
                type="button"
                className="bookmarks-empty-add-btn"
                onClick={handleOpenAdd}
              >
                <Plus size={12} />
                <span>Add first bookmark</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Edit / Add Modal */}
      <QuickAddBookmarkModal
        isOpen={quickAddOpen}
        onClose={handleCloseModal}
        initialBookmark={editingBookmark}
      />

      {/* Mobile Long-Press Action Sheet */}
      {mobileActionBm &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="mobile-bm-sheet-backdrop"
            onClick={() => setMobileActionBm(null)}
          >
            <div
              className="mobile-bm-sheet"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="mobile-bm-sheet-handle" />
              <div className="mobile-bm-sheet-header">
                <span className="mobile-bm-sheet-icon">
                  <BookmarkIcon
                    name={mobileActionBm.icon}
                    url={mobileActionBm.url}
                    size={20}
                  />
                </span>
                <div className="mobile-bm-sheet-info">
                  <h4 className="mobile-bm-sheet-title">
                    {mobileActionBm.label}
                  </h4>
                  <span className="mobile-bm-sheet-url">
                    {mobileActionBm.url}
                  </span>
                </div>
              </div>

              <div className="mobile-bm-sheet-actions">
                <button
                  type="button"
                  className="mobile-bm-action-btn mobile-bm-action-open"
                  onClick={() => {
                    window.open(
                      mobileActionBm.url,
                      "_blank",
                      "noopener,noreferrer"
                    );
                    setMobileActionBm(null);
                  }}
                >
                  <ExternalLink size={15} />
                  <span>Open in new tab</span>
                </button>

                <button
                  type="button"
                  className="mobile-bm-action-btn mobile-bm-action-edit"
                  onClick={() => {
                    handleOpenEdit(mobileActionBm);
                  }}
                >
                  <Pencil size={15} />
                  <span>Edit bookmark</span>
                </button>

                <button
                  type="button"
                  className="mobile-bm-action-btn mobile-bm-action-delete"
                  onClick={() => {
                    handleRemoveBookmark(mobileActionBm);
                    setMobileActionBm(null);
                  }}
                >
                  <Trash2 size={15} />
                  <span>Delete bookmark</span>
                </button>

                <button
                  type="button"
                  className="mobile-bm-action-btn mobile-bm-action-cancel"
                  onClick={() => setMobileActionBm(null)}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
