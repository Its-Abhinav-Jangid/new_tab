import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const STORAGE_KEY = "hacker_tab_settings";

// ── Default settings ──────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  // Appearance
  accent: "#7dcfff", // hacktricks cyan by default
  font: "mono", // 'mono' | 'sans'
  cardSize: "medium", // 'compact' | 'medium' | 'large'
  showGreeting: true,
  greetingName: "hacker",

  // Clock
  timeFormat: "24h", // '24h' | '12h'
  showSeconds: true,
  showDate: true,

  // Search
  defaultEngine: 0, // index into ENGINES array

  // Feed: Maintained bug bounty writeup sources
  feedSources: [
    {
      id: "infosecwriteups",
      label: "InfoSec Writeups",
      url: "https://infosecwriteups.com/feed",
      type: "rss",
      enabled: true,
    },
    {
      id: "intigriti",
      label: "Intigriti (Bug Bytes)",
      url: "https://www.intigriti.com/blog/feed",
      type: "rss",
      enabled: true,
    },
    {
      id: "portswigger",
      label: "PortSwigger Research",
      url: "https://portswigger.net/research/rss",
      type: "rss",
      enabled: true,
    },
    {
      id: "pentesterland",
      label: "Pentester Land Database",
      url: "https://pentester.land/writeups.json",
      type: "pentesterland",
      enabled: true,
    },
    {
      id: "tldrsec",
      label: "tl;dr sec (AppSec)",
      url: "https://tldrsec.com/feed.xml",
      type: "rss",
      enabled: false,
    },
  ],
  cardCount: 20,

  // Bookmarks
  bookmarks: [
    {
      id: "1",
      label: "HackTricks",
      url: "https://book.hacktricks.xyz",
      icon: "BookOpen",
    },
    {
      id: "2",
      label: "PortSwigger",
      url: "https://portswigger.net/web-security",
      icon: "Shield",
    },
    {
      id: "3",
      label: "GTFOBins",
      url: "https://gtfobins.github.io",
      icon: "Terminal",
    },
    {
      id: "4",
      label: "CVE Details",
      url: "https://www.cvedetails.com",
      icon: "Search",
    },
    {
      id: "5",
      label: "ExploitDB",
      url: "https://www.exploit-db.com",
      icon: "Flame",
    },
    { id: "6", label: "Shodan", url: "https://www.shodan.io", icon: "Radio" },
    {
      id: "7",
      label: "CyberChef",
      url: "https://gchq.github.io/CyberChef",
      icon: "Cpu",
    },
    {
      id: "8",
      label: "RevShells",
      url: "https://www.revshells.com",
      icon: "Link",
    },
  ],
};

// Helper: load stored settings safely with backwards compatibility
function getStoredSettings() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ht_settings");
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Ensure all maintained sources exist in feedSources while preserving user toggles
    let feedSources = DEFAULT_SETTINGS.feedSources;
    if (Array.isArray(parsed.feedSources)) {
      const savedMap = new Map(
        parsed.feedSources.map((s) => [s.id, s.enabled]),
      );
      feedSources = DEFAULT_SETTINGS.feedSources.map((def) => ({
        ...def,
        enabled: savedMap.has(def.id) ? savedMap.get(def.id) : def.enabled,
      }));
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      feedSources,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ── Context ───────────────────────────────────────────────────────
const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  // useState hook for settings with localStorage persistence
  const [settings, setSettingsState] = useState(getStoredSettings);

  // Synchronize state changes to localStorage and CSS variables
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Unable to save settings to localStorage:", e);
    }

    if (settings.accent) {
      document.documentElement.style.setProperty("--accent", settings.accent);
    }
  }, [settings]);

  // Easily update a single key, an object of changes, or a function updater
  const updateSetting = useCallback((keyOrUpdate, value) => {
    setSettingsState((prev) => {
      if (typeof keyOrUpdate === "function") {
        return keyOrUpdate(prev);
      }
      if (typeof keyOrUpdate === "string") {
        return { ...prev, [keyOrUpdate]: value };
      }
      if (keyOrUpdate && typeof keyOrUpdate === "object") {
        return { ...prev, ...keyOrUpdate };
      }
      return prev;
    });
  }, []);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
  }, []);

  // Return dual interface: callable via array [settings, updateSetting] OR object destructuring
  const contextValue = [settings, updateSetting, setSettingsState];
  contextValue.settings = settings;
  contextValue.setSettings = setSettingsState;
  contextValue.updateSetting = updateSetting;
  contextValue.update = updateSetting;
  contextValue.reset = resetSettings;
  contextValue.resetSettings = resetSettings;

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook: easily access settings and update them
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside a SettingsProvider");
  }
  return ctx;
}
