import { useState, useEffect } from "react";
import "./App.css";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Clock from "./components/Clock";
import Greeting from "./components/Greeting";
import SearchBar from "./components/SearchBar";
import WriteupFeed from "./components/WriteupFeed";
import Bookmarks from "./components/Bookmarks";
import Scratchpad from "./components/Scratchpad";
import Settings from "./components/Settings";
import ShortcutsModal from "./components/ShortcutsModal";
import WelcomeModal from "./components/WelcomeModal";
import { Settings as SettingsIcon, FileText, Command } from "lucide-react";

const FOOTER_PUNCHLINES = [
  "// hacker tab — stay sharp · your FBI agent gives this setup 10/10",
  "// hacker tab — there is no cloud, just someone else's computer",
  "// hacker tab — with great root access comes great responsibility",
  "// hacker tab — built with curiosity, caffeine, and questionable regex",
  "// hacker tab — git commit -m 'fixed bug, created 2 cooler ones'",
  "// hacker tab — keep calm and chmod +x everything",
];

function AppShell() {
  const { settings } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [hasScratchpadContent, setHasScratchpadContent] = useState(() => {
    try {
      return Boolean(localStorage.getItem("hacker_tab_scratchpad")?.trim());
    } catch {
      return false;
    }
  });
  const [footerQuote] = useState(
    () =>
      FOOTER_PUNCHLINES[Math.floor(Math.random() * FOOTER_PUNCHLINES.length)],
  );

  const showScratchpad = settings?.showScratchpad ?? true;

  // Global key listener for Settings (Alt+, / ,), Scratchpad (Alt+N / N), and Shortcuts (Alt+? / ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTextarea = tag === "textarea";
      const isInput =
        tag === "input" ||
        tag === "select" ||
        document.activeElement?.isContentEditable;

      const hasModifier = e.altKey || e.ctrlKey || e.metaKey;

      // 1. Prefixed shortcuts (Alt or Ctrl) — WORK EVERYWHERE, INCLUDING SEARCH BAR
      if (hasModifier) {
        // Alt+N or Ctrl+N: Scratchpad
        if (e.key === "n" || e.key === "N") {
          if (showScratchpad) {
            e.preventDefault();
            setScratchpadOpen((prev) => !prev);
          }
          return;
        }

        // Alt+, or Ctrl+,: Settings
        if (e.key === "," || e.key === "<") {
          e.preventDefault();
          setSettingsOpen((prev) => !prev);
          return;
        }

        // Alt+? or Alt+/ or Ctrl+?: Shortcuts cheat sheet
        if (e.key === "?" || (e.altKey && e.key === "/")) {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
          return;
        }

        return;
      }

      // 2. Unprefixed shortcuts (N, ,, ?) — work when not typing in an input/textarea
      if (!isInput && !isTextarea) {
        if (e.key === ",") {
          e.preventDefault();
          setSettingsOpen((prev) => !prev);
        } else if (e.key === "n" || e.key === "N") {
          if (showScratchpad) {
            e.preventDefault();
            setScratchpadOpen((prev) => !prev);
          }
        } else if (e.key === "?") {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showScratchpad]);

  // Suppress native browser title tooltips on mobile / touch devices
  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (!isTouch) return;

    const handleTouchStart = (e) => {
      const target = e.target.closest("[title]");
      if (target) {
        const originalTitle = target.getAttribute("title");
        target.removeAttribute("title");
        const restore = () => {
          target.setAttribute("title", originalTitle);
          window.removeEventListener("touchend", restore);
          window.removeEventListener("touchcancel", restore);
        };
        window.addEventListener("touchend", restore, { once: true });
        window.addEventListener("touchcancel", restore, { once: true });
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      capture: true,
      passive: true,
    });
    return () =>
      document.removeEventListener("touchstart", handleTouchStart, {
        capture: true,
      });
  }, []);

  return (
    <div className="app">
      {/* Top bar: clock + actions */}
      <header className="app-header">
        <Clock />
        <div className="header-actions">
          {showScratchpad && (
            <button
              className={`header-btn scratchpad-header-btn ${
                scratchpadOpen ? "active" : ""
              }`}
              onClick={() => setScratchpadOpen((prev) => !prev)}
              data-tooltip="Scratchpad (Alt+N)"
              title="Scratchpad buffer (Press Alt+N or N)"
              type="button"
              aria-label="Open scratchpad"
            >
              <FileText size={16} />
              {hasScratchpadContent && <span className="header-btn-dot" />}
            </button>
          )}
          <button
            className={`header-btn shortcuts-header-btn ${
              shortcutsOpen ? "active" : ""
            }`}
            onClick={() => setShortcutsOpen(true)}
            data-tooltip="Shortcuts (Alt+?)"
            title="Keyboard shortcuts (Press Alt+? or ?)"
            type="button"
            aria-label="Open keyboard shortcuts"
          >
            <Command size={15} />
          </button>
          <button
            className={`header-btn settings-gear ${
              settingsOpen ? "active" : ""
            }`}
            onClick={() => setSettingsOpen(true)}
            data-tooltip="Settings (Alt+,)"
            title="Settings (Press Alt+, or ,)"
            type="button"
            aria-label="Open settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {/* Centerpiece: Greeting + Search */}
      <section className="app-hero">
        <Greeting />
        <SearchBar />
      </section>

      {/* Main content: bookmarks sidebar + feed */}
      <main className="app-main">
        <aside className="app-sidebar">
          <Bookmarks />
        </aside>
        <section className="app-feed">
          <WriteupFeed />
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <span className="footer-text">{footerQuote}</span>
      </footer>

      {/* Scratchpad slide-out drawer */}
      <Scratchpad
        isOpen={scratchpadOpen}
        onClose={() => setScratchpadOpen(false)}
        onContentChange={(hasText) => setHasScratchpadContent(hasText)}
      />

      {/* Settings drawer */}
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Shortcuts cheat sheet modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* First-time welcome modal */}
      <WelcomeModal />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppShell />
    </SettingsProvider>
  );
}

export default App;
