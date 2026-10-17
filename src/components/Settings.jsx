import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import SearchEngineLogo from "./SearchEngineLogo";
import { Sketch } from "@uiw/react-color";
import {
  Palette,
  Clock as ClockIcon,
  Rss,
  Search as SearchIcon,
  RotateCcw,
  X,
  Pipette,
  CheckCircle2,
  Circle,
  Terminal,
  Check,
  ShieldAlert,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { fetchH1Reports, CORS_PROVIDERS } from "../services/hackeroneApi";
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

      <SectionHeader title="scratchpad" />
      <Row label="Show scratchpad" hint="in-tab notes buffer">
        <Toggle
          value={settings.showScratchpad ?? true}
          onChange={(v) => updateSetting("showScratchpad", v)}
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

// ── Tab: HackerOne ───────────────────────────────────────────────
function HackerOneTab({ settings, updateSetting }) {
  const [showToken, setShowToken] = useState(false);
  const [showCorsKey, setShowCorsKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const selectedProviderId = settings.h1CorsProvider || "corsproxy.io";
  const activeProvider =
    CORS_PROVIDERS.find((p) => p.id === selectedProviderId) ||
    CORS_PROVIDERS[0];

  const handleTestSync = async () => {
    if (!settings.h1Identifier || !settings.h1Token) {
      setTestResult({
        success: false,
        message: "Please enter both an API Identifier and API Token.",
      });
      return;
    }

    if (
      (selectedProviderId === "corsproxy.io" ||
        selectedProviderId === "cors.sh") &&
      !settings.h1CorsApiKey
    ) {
      setTestResult({
        success: false,
        message: `An API key is required for ${activeProvider.name}. Get your free API key at ${activeProvider.urlDoc} and enter it below.`,
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await fetchH1Reports({
      identifier: settings.h1Identifier,
      token: settings.h1Token,
      corsProvider: selectedProviderId,
      corsApiKey: settings.h1CorsApiKey,
      customProxyUrl: settings.h1CustomProxyUrl || settings.h1ProxyUrl,
      customHeaderName: settings.h1CustomHeaderName,
      customHeaderValue: settings.h1CustomHeaderValue,
    });

    setTesting(false);

    if (res.success) {
      updateSetting("h1Reports", res.reports);
      updateSetting("h1LastSync", new Date().toISOString());
      updateSetting("h1SyncError", null);
      setTestResult({
        success: true,
        message: `Success! Connected and synced ${res.reports.length} report(s) from HackerOne.`,
      });
    } else {
      updateSetting("h1SyncError", res.error);
      setTestResult({
        success: false,
        message: res.error,
      });
    }
  };

  const handleClear = () => {
    updateSetting("h1Identifier", "");
    updateSetting("h1Token", "");
    updateSetting("h1CorsApiKey", "");
    updateSetting("h1SyncError", null);
    setTestResult(null);
  };

  return (
    <div className="s-tab-content">
      <SectionHeader title="api credentials" />
      <div className="s-h1-info">
        Generate your personal token at{" "}
        <a
          href="https://hackerone.com/settings/api_token/edit"
          target="_blank"
          rel="noopener noreferrer"
          className="s-link"
        >
          hackerone.com/settings/api_token/edit
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="s-field-group">
        <label className="s-label">API Identifier (Token Username)</label>
        <input
          type="text"
          className="s-text-input"
          placeholder="e.g. your_token_identifier"
          value={settings.h1Identifier || ""}
          onChange={(e) => updateSetting("h1Identifier", e.target.value)}
        />
      </div>

      <div className="s-field-group">
        <div className="s-label-row">
          <label className="s-label">API Token Value</label>
          <button
            type="button"
            className="s-link-btn"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? <EyeOff size={11} /> : <Eye size={11} />}
            <span>{showToken ? "Hide" : "Show"}</span>
          </button>
        </div>
        <input
          type={showToken ? "text" : "password"}
          className="s-text-input"
          placeholder="••••••••••••••••••••••••"
          value={settings.h1Token || ""}
          onChange={(e) => updateSetting("h1Token", e.target.value)}
        />
      </div>

      <SectionHeader title="cors & proxy setup" />
      <div className="s-field-group">
        <label className="s-label">Standard CORS Provider</label>
        <select
          className="s-select"
          value={selectedProviderId}
          onChange={(e) => updateSetting("h1CorsProvider", e.target.value)}
        >
          {CORS_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="s-hint-sub">
          {activeProvider.description}{" "}
          {activeProvider.urlDoc && (
            <a
              href={activeProvider.urlDoc}
              target="_blank"
              rel="noopener noreferrer"
              className="s-link"
            >
              Get Free Key
              <ExternalLink size={10} />
            </a>
          )}
        </span>
      </div>

      {(selectedProviderId === "corsproxy.io" ||
        selectedProviderId === "cors.sh") && (
        <div className="s-field-group">
          <div className="s-label-row">
            <label className="s-label">
              {selectedProviderId === "corsproxy.io"
                ? "corsproxy.io API Key"
                : "cors.sh API Key"}
            </label>
            <button
              type="button"
              className="s-link-btn"
              onClick={() => setShowCorsKey(!showCorsKey)}
            >
              {showCorsKey ? <EyeOff size={11} /> : <Eye size={11} />}
              <span>{showCorsKey ? "Hide" : "Show"}</span>
            </button>
          </div>
          <input
            type={showCorsKey ? "text" : "password"}
            className="s-text-input"
            placeholder={activeProvider.keyPlaceholder || "Paste API key..."}
            value={settings.h1CorsApiKey || ""}
            onChange={(e) => updateSetting("h1CorsApiKey", e.target.value)}
          />
        </div>
      )}

      {selectedProviderId === "custom" && (
        <>
          <div className="s-field-group">
            <label className="s-label">Custom Proxy URL</label>
            <input
              type="text"
              className="s-text-input"
              placeholder="https://my-worker.workers.dev/?url="
              value={settings.h1CustomProxyUrl || settings.h1ProxyUrl || ""}
              onChange={(e) => {
                updateSetting("h1CustomProxyUrl", e.target.value);
                updateSetting("h1ProxyUrl", e.target.value);
              }}
            />
          </div>
          <div className="s-field-group">
            <label className="s-label">Custom Header Name (Optional)</label>
            <input
              type="text"
              className="s-text-input"
              placeholder="e.g. x-api-key or Authorization"
              value={settings.h1CustomHeaderName || ""}
              onChange={(e) =>
                updateSetting("h1CustomHeaderName", e.target.value)
              }
            />
          </div>
          <div className="s-field-group">
            <label className="s-label">Custom Header Value (Optional)</label>
            <input
              type="text"
              className="s-text-input"
              placeholder="e.g. secret_token_123"
              value={settings.h1CustomHeaderValue || ""}
              onChange={(e) =>
                updateSetting("h1CustomHeaderValue", e.target.value)
              }
            />
          </div>
        </>
      )}

      {selectedProviderId === "direct" && (
        <div className="s-field-group">
          <span className="s-hint-sub s-hint-warn">
            {
              "// Direct requests require running in a browser extension with host permissions. Standard browser tabs will encounter CORS errors."
            }
          </span>
        </div>
      )}

      <SectionHeader title="synchronization" />
      <Row label="Auto-sync on load" hint="Sync reports when opening new tab">
        <Toggle
          value={settings.h1AutoSync ?? true}
          onChange={(v) => updateSetting("h1AutoSync", v)}
        />
      </Row>

      <div className="s-h1-actions">
        <button
          type="button"
          className="s-h1-test-btn"
          onClick={handleTestSync}
          disabled={testing}
        >
          <RefreshCw size={12} className={testing ? "spin" : ""} />
          <span>{testing ? "Testing connection..." : "Test & Sync Now"}</span>
        </button>

        {(settings.h1Identifier || settings.h1Token) && (
          <button
            type="button"
            className="s-h1-clear-btn"
            onClick={handleClear}
          >
            Disconnect
          </button>
        )}
      </div>

      {testResult && (
        <div
          className={`s-test-result ${testResult.success ? "success" : "error"}`}
        >
          {testResult.message}
        </div>
      )}
    </div>
  );
}

// ── Main Settings Panel ───────────────────────────────────────────
const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "clock", label: "Clock", icon: ClockIcon },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "hackerone", label: "HackerOne", icon: ShieldAlert },
  { id: "search", label: "Search", icon: SearchIcon },
];

export default function Settings({ open, onClose }) {
  // Can be destructured as [settings, updateSetting] array style or object style!
  const [settings, updateSetting] = useSettings();
  const { reset } = useSettings();
  const [activeTab, setActiveTab] = useState("appearance");

  // Lock background scrolling while settings drawer is open
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
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
          {activeTab === "hackerone" && (
            <HackerOneTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "search" && (
            <SearchTab settings={settings} updateSetting={updateSetting} />
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

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}
