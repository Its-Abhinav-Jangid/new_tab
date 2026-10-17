import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import {
  Terminal,
  CornerDownLeft,
  Search,
  ArrowUpRight,
  Bookmark,
  Plus,
} from "lucide-react";
import SearchEngineLogo from "./SearchEngineLogo";
import BookmarkIcon from "./BookmarkIcon";
import { fetchGoogleSuggestions } from "../utils/searchSuggestions";
import {
  deriveLabelFromUrl,
  formatBookmarkUrl,
  isValidUrl,
} from "../utils/bookmarkUtils";
import "./SearchBar.css";

const ENGINES = [
  { label: "Google", prefix: "https://google.com/search?q=" },
  { label: "DuckDuckGo", prefix: "https://duckduckgo.com/?q=" },
  { label: "Shodan", prefix: "https://www.shodan.io/search?query=" },
  { label: "GitHub", prefix: "https://github.com/search?q=" },
];

const ENGINE_PLACEHOLDERS = {
  Google: [
    "Search Google (Stack Overflow is waiting)...",
    "Search Google (just to read AI summary)",

    "Search Google · check page 2 only if truly desperate...",
  ],
  DuckDuckGo: [
    "Search DuckDuckGo with zero creepy trackers...",
    "Search DuckDuckGo · incognito mode squared...",
    "Search DuckDuckGo · keeping your queries strictly confidential...",
  ],
  Shodan: [
    "Query Shodan for exposed coffee makers & webcams...",
    "Search Shodan · please don't touch the centrifuges...",
    "Scan Shodan for devices that shouldn't be online...",
  ],
  GitHub: [
    "Search GitHub for code to copy-paste responsibly...",
    "Search GitHub for abandoned repos with 5k stars...",
    "Find a repo that does what you spent 3 days writing...",
  ],
};

export default function SearchBar() {
  const { settings, updateSetting } = useSettings();
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState(settings?.defaultEngine ?? 0);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (settings?.defaultEngine !== undefined) {
      setEngine(settings.defaultEngine);
    }
  }, [settings?.defaultEngine]);

  const currentEngineLabel = ENGINES[engine]?.label || "Google";
  const placeholder = useMemo(() => {
    const list = ENGINE_PLACEHOLDERS[currentEngineLabel] || [
      `Search ${currentEngineLabel}...`,
    ];
    return list[Math.floor(Math.random() * list.length)];
  }, [currentEngineLabel]);

  // Outside click listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global key listener: Press '/' or 'Ctrl+K' / 'Cmd+K' to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        document.activeElement?.isContentEditable;

      if (
        (e.key === "/" && !isInput) ||
        ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K"))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Fetch suggestions with 150ms debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await fetchGoogleSuggestions(trimmed);
      setSuggestions(results);
      setShowDropdown(true);
      setActiveIndex(-1);
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Combine matching bookmarks + quick add option + web search suggestions
  const items = useMemo(() => {
    const rawTrimmed = query.trim();
    const trimmed = rawTrimmed.toLowerCase();
    if (!trimmed) return [];

    const bookmarkMatches = (settings?.bookmarks || [])
      .filter(
        (bm) =>
          bm.label?.toLowerCase().includes(trimmed) ||
          bm.url?.toLowerCase().includes(trimmed),
      )
      .slice(0, 2)
      .map((bm) => ({
        type: "bookmark",
        text: bm.label,
        url: bm.url,
        icon: bm.icon,
      }));

    // Detect if user typed a bookmark command ("bm https://...", "+bm url", "bookmark url") or a URL
    const isBmCommand = /^(\+?bm|bookmark|add)\s+/i.test(rawTrimmed);
    const targetUrl = isBmCommand
      ? rawTrimmed.replace(/^(\+?bm|bookmark|add)\s+/i, "").trim()
      : rawTrimmed;

    let quickAddItem = null;
    if (isValidUrl(targetUrl)) {
      const formatted = formatBookmarkUrl(targetUrl);
      const exists = (settings?.bookmarks || []).some(
        (b) => b.url?.toLowerCase() === formatted.toLowerCase(),
      );
      if (!exists) {
        const derived = deriveLabelFromUrl(formatted);
        quickAddItem = {
          type: "quick_add_bookmark",
          text: `Stash bookmark: ${derived || targetUrl}`,
          url: formatted,
          label: derived || "Link",
          icon: "favicon",
        };
      }
    }

    const searchMatches = suggestions.map((s) => ({
      type: "search",
      text: s,
    }));

    if (isBmCommand && quickAddItem) {
      return [quickAddItem, ...bookmarkMatches, ...searchMatches];
    }

    return quickAddItem
      ? [...bookmarkMatches, quickAddItem, ...searchMatches]
      : [...bookmarkMatches, ...searchMatches];
  }, [query, suggestions, settings?.bookmarks]);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[activeIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  const executeSearch = useCallback(
    (targetText) => {
      const term = (targetText || query).trim();
      if (!term) return;
      const selected = ENGINES[engine] || ENGINES[0];
      window.open(selected.prefix + encodeURIComponent(term), "_blank");
      setQuery("");
      setShowDropdown(false);
      setActiveIndex(-1);
    },
    [engine, query],
  );

  function handleSelect(item) {
    if (!item) return;
    if (item.type === "bookmark") {
      window.open(item.url, "_blank", "noopener,noreferrer");
      setQuery("");
      setShowDropdown(false);
      setActiveIndex(-1);
    } else if (item.type === "quick_add_bookmark") {
      const newBookmark = {
        id: Date.now().toString(),
        label: item.label,
        url: item.url,
        icon: item.icon || "favicon",
      };
      updateSetting("bookmarks", [...(settings?.bookmarks || []), newBookmark]);
      setQuery("");
      setShowDropdown(false);
      setActiveIndex(-1);
    } else {
      executeSearch(item.text);
    }
  }

  function handleKeyDown(e) {
    // Switch search engines using Alt+1..4
    if (e.altKey && ["1", "2", "3", "4"].includes(e.key)) {
      e.preventDefault();
      const targetIndex = parseInt(e.key, 10) - 1;
      if (targetIndex >= 0 && targetIndex < ENGINES.length) {
        setEngine(targetIndex);
      }
      return;
    }

    // If query is empty and user hits Tab, cycle to next search engine
    if (e.key === "Tab" && !query.trim() && (!showDropdown || items.length === 0)) {
      e.preventDefault();
      setEngine((prev) => (prev + 1) % ENGINES.length);
      return;
    }

    // Escape handling: dismiss dropdown, clear query, or blur
    if (e.key === "Escape") {
      e.preventDefault();
      if (showDropdown) {
        setShowDropdown(false);
        setActiveIndex(-1);
      } else if (query) {
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      return;
    }

    if (!showDropdown || items.length === 0) {
      if (e.key === "ArrowDown" && items.length > 0) {
        e.preventDefault();
        setShowDropdown(true);
        setActiveIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : -1));
        break;

      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > -1 ? prev - 1 : items.length - 1));
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          handleSelect(items[activeIndex]);
        } else {
          executeSearch();
        }
        break;

      case "Tab":
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          setQuery(items[activeIndex].text);
          setActiveIndex(-1);
        } else if (items.length > 0) {
          e.preventDefault();
          setQuery(items[0].text);
        }
        break;

      default:
        break;
    }
  }

  function highlightMatch(text, queryText) {
    if (!queryText || !queryText.trim()) return text;
    const q = queryText.trim().toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.substring(0, idx)}
        <span className="suggestion-matched">
          {text.substring(idx, idx + q.length)}
        </span>
        {text.substring(idx + q.length)}
      </>
    );
  }

  return (
    <div className="search-wrapper" ref={wrapperRef}>
      {/* Engine picker */}
      <div className="search-engines">
        {ENGINES.map((e, i) => (
          <button
            key={e.label}
            type="button"
            className={`engine-btn ${i === engine ? "active" : ""}`}
            onClick={() => setEngine(i)}
            data-tooltip={`${e.label} (Alt+${i + 1})`}
            title={`${e.label} (Alt+${i + 1})`}
            aria-label={e.label}
          >
            <SearchEngineLogo engine={e.label} size={17} />
          </button>
        ))}
      </div>

      {/* Input container */}
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch();
        }}
      >
        <span className="search-prompt" aria-hidden="true">
          <Terminal size={15} />
        </span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (items.length > 0) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
        <button className="search-submit" type="submit" title="Search">
          <CornerDownLeft size={15} />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && items.length > 0 && (
        <div className="search-suggestions-dropdown" role="listbox">
          <ul className="search-suggestions-list" ref={listRef}>
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isBookmark = item.type === "bookmark";
              const isAddBookmark = item.type === "quick_add_bookmark";
              return (
                <li
                  key={`${item.type}-${item.text}-${idx}`}
                  className={`suggestion-item ${isActive ? "active" : ""} ${
                    isBookmark ? "is-bookmark" : ""
                  } ${isAddBookmark ? "is-add-bookmark" : ""}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(item)}
                >
                  <span className="suggestion-icon-box">
                    {isBookmark || isAddBookmark ? (
                      <BookmarkIcon
                        name={item.icon || (isAddBookmark ? "favicon" : "Bookmark")}
                        url={item.url}
                        size={14}
                      />
                    ) : (
                      <Search size={14} className="suggestion-search-icon" />
                    )}
                  </span>
                  <span className="suggestion-text">
                    {isAddBookmark ? (
                      item.text
                    ) : (
                      highlightMatch(item.text, query)
                    )}
                  </span>
                  {isBookmark && (
                    <span className="suggestion-badge">
                      <Bookmark size={10} />
                      <span>bookmark</span>
                    </span>
                  )}
                  {isAddBookmark && (
                    <span className="suggestion-badge is-add-badge">
                      <Plus size={10} />
                      <span>quick stash</span>
                    </span>
                  )}
                  <span className="suggestion-action-hint">
                    {isBookmark ? (
                      <ArrowUpRight size={13} />
                    ) : isAddBookmark ? (
                      <CornerDownLeft size={13} />
                    ) : isActive ? (
                      "↵"
                    ) : (
                      ""
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="search-dropdown-footer">
            <span className="dropdown-keys-hint">
              <span className="key-kbd">↑↓</span> navigate
              <span className="key-sep">·</span>
              <span className="key-kbd">↵</span> select
              <span className="key-sep">·</span>
              <span className="key-kbd">tab</span> complete
              <span className="key-sep">·</span>
              <span className="key-kbd">esc</span> close
            </span>
            <span className="dropdown-engine-hint">
              via {ENGINES[engine]?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
