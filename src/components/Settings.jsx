import { useState, useRef, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import BookmarkIcon, { AVAILABLE_BOOKMARK_ICONS } from "./BookmarkIcon";
import SearchEngineLogo from "./SearchEngineLogo";
import { Sketch } from "@uiw/react-color";
import {
  Palette,
  Clock as ClockIcon,
  Rss,
  Search as SearchIcon,
  Bookmark as BookmarkIconLucide,
  RotateCcw,
  X,
  Pipette,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Terminal,
  Check,
  Pencil,
} from "lucide-react";
import "./Settings.css";

// ── Sub-sections ─────────────────────────────────────────────────

function SectionHeader({ title }) {
  return <h3 className="s-section-header">{`// ${title}`}</h3>;
}

function Row({ label, hint, children }) {
  return (
    <div className="s-row">
      <div className="s-row-label">
        <span>{label}</span>
        {hint && <span className="s-hint">{hint}</span>}
      </div>
      <div className="s-row-control">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      className={`s-toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
      type="button"
      aria-pressed={value}
    >
      <span className="s-toggle-thumb" />
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="s-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Tab: Appearance ───────────────────────────────────────────────
const ACCENTS = [
  { label: "HT Cyan", value: "#7dcfff" },
  { label: "Blue", value: "#7aa2f7" },
  { label: "Purple", value: "#bb9af7" },
  { label: "Green", value: "#9ece6a" },
  { label: "Orange", value: "#ff9e64" },
  { label: "Pink", value: "#f7768e" },
];

function AppearanceTab({ settings, updateSetting }) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [draftColor, setDraftColor] = useState(settings.accent || "#7dcfff");

  const draftColorRef = useRef(draftColor);
  draftColorRef.current = draftColor;
  const showCustomPickerRef = useRef(showCustomPicker);
  showCustomPickerRef.current = showCustomPicker;

  const isCustom = !ACCENTS.some(
    (a) => a.value.toLowerCase() === (settings.accent || "").toLowerCase(),
  );

  // Sync draftColor with settings.accent when picker is NOT open
  useEffect(() => {
    if (!showCustomPicker) {
      setDraftColor(settings.accent || "#7dcfff");
    }
  }, [settings.accent, showCustomPicker]);

  // When unmounting (e.g. settings drawer closed), commit the custom color if picker was open
  useEffect(() => {
    return () => {
      if (showCustomPickerRef.current && draftColorRef.current) {
        updateSetting("accent", draftColorRef.current);
      }
    };
  }, [updateSetting]);

  // Commit and close custom picker
  const closeAndCommitPicker = () => {
    if (draftColor) {
      updateSetting("accent", draftColor);
    }
    setShowCustomPicker(false);
  };

  const openPicker = () => {
    setDraftColor(settings.accent || "#7dcfff");
    setShowCustomPicker(true);
  };

  const togglePicker = () => {
    if (showCustomPicker) {
      closeAndCommitPicker();
    } else {
      openPicker();
    }
  };

  const handlePresetClick = (presetColor) => {
    setShowCustomPicker(false);
    updateSetting("accent", presetColor);
  };

  return (
    <div className="s-tab-content">
      <SectionHeader title="accent color" />
      <div className="s-swatches">
        {ACCENTS.map((a) => (
          <button
            key={a.value}
            className={`s-swatch ${
              settings.accent?.toLowerCase() === a.value.toLowerCase()
                ? "active"
                : ""
            }`}
            style={{ "--swatch": a.value }}
            onClick={() => handlePresetClick(a.value)}
            title={a.label}
            type="button"
          />
        ))}
        {/* Custom color trigger button */}
        <button
          className={`s-swatch s-swatch-custom ${isCustom ? "active" : ""}`}
          style={isCustom ? { "--swatch": settings.accent } : {}}
          onClick={togglePicker}
          title={
            showCustomPicker ? "Apply & Close Picker" : "Custom Color Palette"
          }
          type="button"
        >
          <Pipette size={13} className="s-pipette-icon" />
        </button>
      </div>

      {/* Custom color input & interactive Sketch palette */}
      <div className="s-custom-picker-section">
        <div className="s-custom-picker-header">
          <div className="s-custom-preview-wrap">
            <span
              className="s-custom-preview-dot"
              style={{
                backgroundColor: showCustomPicker
                  ? draftColor
                  : settings.accent,
              }}
            />
            <input
              type="text"
              className="s-custom-hex-input"
              value={
                showCustomPicker ? draftColor : settings.accent || "#7dcfff"
              }
              onChange={(e) => {
                const val = e.target.value.trim();
                const formatted = val.startsWith("#") ? val : `#${val}`;
                if (showCustomPicker) {
                  setDraftColor(formatted);
                } else {
                  updateSetting("accent", formatted);
                }
              }}
              placeholder="#7dcfff"
              maxLength={9}
            />
          </div>
          <button
            type="button"
            className="s-picker-toggle-btn"
            onClick={togglePicker}
          >
            {showCustomPicker ? "Done / Close ▲" : "Custom Picker ▼"}
          </button>
        </div>

        {showCustomPicker && (
          <div className="s-sketch-container">
            <Sketch
              color={draftColor}
              disableAlpha={true}
              onChange={(color) => {
                setDraftColor(color.hex);
              }}
            />
            <div className="s-picker-actions">
              <span className="s-picker-hint">{"// applies on close"}</span>
              <button
                type="button"
                className="s-picker-done-btn"
                onClick={closeAndCommitPicker}
              >
                <Check size={12} />
                <span>Apply</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <SectionHeader title="typography" />
      <Row label="Font style">
        <Select
          value={settings.font}
          onChange={(v) => updateSetting("font", v)}
          options={[
            { value: "mono", label: "Monospace (hacker)" },
            { value: "sans", label: "Sans-serif (clean)" },
          ]}
        />
      </Row>
      <Row label="Card size">
        <Select
          value={settings.cardSize}
          onChange={(v) => updateSetting("cardSize", v)}
          options={[
            { value: "compact", label: "Compact" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ]}
        />
      </Row>

      <SectionHeader title="greeting" />
      <Row label="Show greeting">
        <Toggle
          value={settings.showGreeting}
          onChange={(v) => updateSetting("showGreeting", v)}
        />
      </Row>
      <Row label="Your name" hint="shown in greeting">
        <input
          className="s-input"
          value={settings.greetingName}
          onChange={(e) => updateSetting("greetingName", e.target.value)}
          placeholder="hacker"
          maxLength={24}
        />
      </Row>
    </div>
  );
}

// ── Tab: Clock ────────────────────────────────────────────────────
function ClockTab({ settings, updateSetting }) {
  return (
    <div className="s-tab-content">
      <SectionHeader title="clock display" />
      <Row label="Time format">
        <Select
          value={settings.timeFormat}
          onChange={(v) => updateSetting("timeFormat", v)}
          options={[
            { value: "24h", label: "24-hour (14:30)" },
            { value: "12h", label: "12-hour (2:30 PM)" },
          ]}
        />
      </Row>
      <Row label="Show seconds">
        <Toggle
          value={settings.showSeconds}
          onChange={(v) => updateSetting("showSeconds", v)}
        />
      </Row>
      <Row label="Show date">
        <Toggle
          value={settings.showDate}
          onChange={(v) => updateSetting("showDate", v)}
        />
      </Row>
    </div>
  );
}

// ── Tab: Feed ─────────────────────────────────────────────────────
function FeedTab({ settings, updateSetting }) {
  function toggleSource(id) {
    const nextSources = settings.feedSources.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s,
    );
    updateSetting("feedSources", nextSources);
  }

  return (
    <div className="s-tab-content">
      <SectionHeader title="feed sources" />
      {settings.feedSources.map((src) => (
        <Row key={src.id} label={src.label} hint={src.url}>
          <Toggle value={src.enabled} onChange={() => toggleSource(src.id)} />
        </Row>
      ))}

      <SectionHeader title="display" />
      <Row label="Articles per source" hint="max 20 on free tier">
        <Select
          value={String(settings.cardCount)}
          onChange={(v) => updateSetting("cardCount", Number(v))}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20 (default)" },
          ]}
        />
      </Row>
    </div>
  );
}

// ── Tab: Search ───────────────────────────────────────────────────
const ENGINES = [
  { label: "Google", prefix: "https://google.com/search?q=" },
  { label: "DuckDuckGo", prefix: "https://duckduckgo.com/?q=" },
  { label: "Shodan", prefix: "https://www.shodan.io/search?query=" },
  { label: "GitHub", prefix: "https://github.com/search?q=" },
];

function SearchTab({ settings, updateSetting }) {
  return (
    <div className="s-tab-content">
      <SectionHeader title="default engine" />
      <div className="s-engine-list">
        {ENGINES.map((e, i) => (
          <button
            key={e.label}
            type="button"
            className={`s-engine-option ${settings.defaultEngine === i ? "active" : ""}`}
            onClick={() => updateSetting("defaultEngine", i)}
          >
            <span className="s-engine-check">
              {settings.defaultEngine === i ? (
                <CheckCircle2 size={15} />
              ) : (
                <Circle size={15} />
              )}
            </span>
            <SearchEngineLogo engine={e.label} size={16} />
            <span className="s-engine-name">{e.label}</span>
            <span className="s-hint">
              {e.prefix.replace("https://", "").split("/")[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Bookmarks ────────────────────────────────────────────────
const AVAILABLE_ICON_KEYS = AVAILABLE_BOOKMARK_ICONS;

function BookmarksTab({ settings, updateSetting }) {
  const [form, setForm] = useState({ icon: "favicon", label: "", url: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  function startEdit(bm) {
    setEditingId(bm.id);
    setForm({
      icon: bm.icon || "favicon",
      label: bm.label || "",
      url: bm.url || "",
    });
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ icon: "favicon", label: "", url: "" });
    setError("");
  }

  function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) {
      setError("Label and URL are required.");
      return;
    }

    let formattedUrl = form.url.trim();
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Enter a valid URL (include https://).");
      return;
    }

    if (editingId) {
      const updated = settings.bookmarks.map((bm) =>
        bm.id === editingId
          ? {
              ...bm,
              icon: form.icon,
              label: form.label.trim(),
              url: formattedUrl,
            }
          : bm,
      );
      updateSetting("bookmarks", updated);
      setEditingId(null);
    } else {
      const newBookmark = {
        id: Date.now().toString(),
        icon: form.icon,
        label: form.label.trim(),
        url: formattedUrl,
      };
      updateSetting("bookmarks", [...settings.bookmarks, newBookmark]);
    }

    setForm({ icon: "favicon", label: "", url: "" });
    setError("");
  }

  function removeBookmark(id) {
    if (editingId === id) {
      cancelEdit();
    }
    updateSetting(
      "bookmarks",
      settings.bookmarks.filter((b) => b.id !== id),
    );
  }

  return (
    <div className="s-tab-content">
      <div className="s-bm-form-header" ref={formRef}>
        <SectionHeader title={editingId ? "edit bookmark" : "add bookmark"} />
        {editingId && (
          <button
            className="s-bm-cancel-link"
            type="button"
            onClick={cancelEdit}
            title="Cancel editing"
          >
            cancel edit
          </button>
        )}
      </div>

      <div className="s-bm-icon-picker">
        {AVAILABLE_ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`s-icon-btn ${form.icon === key ? "active" : ""} ${
              key === "favicon" ? "s-icon-btn-favicon" : ""
            }`}
            onClick={() => setForm((f) => ({ ...f, icon: key }))}
            title={key === "favicon" ? "Website Favicon (Auto)" : key}
          >
            <BookmarkIcon name={key} url={form.url} size={15} />
          </button>
        ))}
      </div>

      <div className="s-bm-form">
        <input
          className="s-input"
          placeholder="Label (e.g. HackTricks)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e);
          }}
          maxLength={24}
        />
        <input
          className="s-input"
          placeholder="URL (https://...)"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e);
          }}
        />
        {form.icon === "favicon" && form.url && (
          <div className="s-bm-favicon-preview">
            <span className="s-hint">Favicon preview:</span>
            <BookmarkIcon name="favicon" url={form.url} size={16} />
          </div>
        )}
        {error && <p className="s-error">{error}</p>}
        <div className="s-bm-form-actions">
          <button
            className="s-btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            {editingId ? <Check size={14} /> : <Plus size={14} />}
            <span>{editingId ? "Save changes" : "Add bookmark"}</span>
          </button>
          {editingId && (
            <button
              className="s-btn-secondary"
              type="button"
              onClick={cancelEdit}
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      <SectionHeader title="current bookmarks" />
      <ul className="s-bm-list">
        {settings.bookmarks.map((bm) => {
          const isEditing = bm.id === editingId;
          return (
            <li
              key={bm.id}
              className={`s-bm-item ${isEditing ? "editing" : ""}`}
            >
              <span className="s-bm-icon">
                <BookmarkIcon name={bm.icon} url={bm.url} size={14} />
              </span>
              <span className="s-bm-label">{bm.label}</span>
              <span className="s-bm-url" title={bm.url}>
                {bm.url}
              </span>
              <div className="s-bm-item-actions">
                <button
                  className={`s-bm-action-btn ${isEditing ? "active" : ""}`}
                  type="button"
                  onClick={() => (isEditing ? cancelEdit() : startEdit(bm))}
                  title={isEditing ? "Cancel edit" : "Edit bookmark"}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="s-bm-action-btn s-bm-remove"
                  type="button"
                  onClick={() => removeBookmark(bm.id)}
                  title="Remove bookmark"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
        {settings.bookmarks.length === 0 && (
          <li className="s-empty">No bookmarks yet.</li>
        )}
      </ul>
    </div>
  );
}

// ── Main Settings Panel ───────────────────────────────────────────
const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "clock", label: "Clock", icon: ClockIcon },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "search", label: "Search", icon: SearchIcon },
  { id: "bookmarks", label: "Bookmarks", icon: BookmarkIconLucide },
];

export default function Settings({ open, onClose }) {
  // Can be destructured as [settings, updateSetting] array style or object style!
  const [settings, updateSetting] = useSettings();
  const { reset } = useSettings();
  const [activeTab, setActiveTab] = useState("appearance");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="s-backdrop" onClick={onClose} />

      {/* Drawer */}
      <aside className="s-drawer" role="dialog" aria-label="Settings">
        {/* Header */}
        <div className="s-header">
          <span className="s-title">
            <Terminal size={14} className="s-title-prompt" />
            <span>settings</span>
          </span>
          <div className="s-header-actions">
            <button
              className="s-reset-btn"
              type="button"
              onClick={reset}
              title="Reset all to defaults"
            >
              <RotateCcw size={11} />
              <span>reset</span>
            </button>
            <button
              className="s-close-btn"
              type="button"
              onClick={onClose}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <nav className="s-tabs">
          {TABS.map((t) => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={`s-tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <TabIcon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab body */}
        <div className="s-body">
          {activeTab === "appearance" && (
            <AppearanceTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "clock" && (
            <ClockTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "feed" && (
            <FeedTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "search" && (
            <SearchTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "bookmarks" && (
            <BookmarksTab settings={settings} updateSetting={updateSetting} />
          )}
        </div>

        {/* Footer */}
        <div className="s-footer">
          <span className="s-footer-note">
            {"// changes save automatically"}
          </span>
        </div>
      </aside>
    </>
  );
}
