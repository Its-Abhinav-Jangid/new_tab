import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import BookmarkIcon, { AVAILABLE_BOOKMARK_ICONS } from "./BookmarkIcon";
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
  { label: "Green", value: "#39d353" },
  { label: "Cyan", value: "#58a6ff" },
  { label: "Purple", value: "#bc8cff" },
  { label: "Orange", value: "#f78166" },
  { label: "Yellow", value: "#e3b341" },
  { label: "Pink", value: "#f778ba" },
];

function AppearanceTab({ settings, updateSetting }) {
  return (
    <div className="s-tab-content">
      <SectionHeader title="accent color" />
      <div className="s-swatches">
        {ACCENTS.map((a) => (
          <button
            key={a.value}
            className={`s-swatch ${settings.accent === a.value ? "active" : ""}`}
            style={{ "--swatch": a.value }}
            onClick={() => updateSetting("accent", a.value)}
            title={a.label}
            type="button"
          />
        ))}
        {/* Custom color picker */}
        <label className="s-swatch s-swatch-custom" title="Custom color">
          <input
            type="color"
            value={settings.accent}
            onChange={(e) => updateSetting("accent", e.target.value)}
          />
          <Pipette size={13} className="s-pipette-icon" />
        </label>
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
  const [form, setForm] = useState({ icon: "Link", label: "", url: "" });
  const [error, setError] = useState("");

  function addBookmark() {
    if (!form.label.trim() || !form.url.trim()) {
      setError("Label and URL are required.");
      return;
    }
    try {
      new URL(form.url);
    } catch {
      setError("Enter a valid URL (include https://).");
      return;
    }

    const newBookmark = { id: Date.now().toString(), ...form };
    updateSetting("bookmarks", [...settings.bookmarks, newBookmark]);
    setForm({ icon: "Link", label: "", url: "" });
    setError("");
  }

  function removeBookmark(id) {
    updateSetting(
      "bookmarks",
      settings.bookmarks.filter((b) => b.id !== id),
    );
  }

  return (
    <div className="s-tab-content">
      <SectionHeader title="add bookmark" />

      <div className="s-bm-icon-picker">
        {AVAILABLE_ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`s-icon-btn ${form.icon === key ? "active" : ""}`}
            onClick={() => setForm((f) => ({ ...f, icon: key }))}
            title={key}
          >
            <BookmarkIcon name={key} size={15} />
          </button>
        ))}
      </div>

      <div className="s-bm-form">
        <input
          className="s-input"
          placeholder="Label (e.g. HackTricks)"
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          maxLength={24}
        />
        <input
          className="s-input"
          placeholder="URL (https://...)"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        />
        {error && <p className="s-error">{error}</p>}
        <button className="s-btn-primary" type="button" onClick={addBookmark}>
          <Plus size={14} />
          <span>Add bookmark</span>
        </button>
      </div>

      <SectionHeader title="current bookmarks" />
      <ul className="s-bm-list">
        {settings.bookmarks.map((bm) => (
          <li key={bm.id} className="s-bm-item">
            <span className="s-bm-icon">
              <BookmarkIcon name={bm.icon} size={14} />
            </span>
            <span className="s-bm-label">{bm.label}</span>
            <span className="s-bm-url">{bm.url}</span>
            <button
              className="s-bm-remove"
              type="button"
              onClick={() => removeBookmark(bm.id)}
              title="Remove"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
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
          <span className="s-footer-note">{"// changes save automatically"}</span>
        </div>
      </aside>
    </>
  );
}
