import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { Rss, User, Clock, ExternalLink, Tag, DollarSign, Layers } from "lucide-react";
import "./WriteupFeed.css";

const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const timestamp = new Date(dateStr).getTime();
  if (isNaN(timestamp)) return dateStr;
  const diff = (Date.now() - timestamp) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / (86400 * 30))}mo ago`;
}

function WriteupCard({ item }) {
  return (
    <a
      className="writeup-card"
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {item.thumbnail && (
        <img
          className="writeup-thumb"
          src={item.thumbnail}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="writeup-body">
        <div className="writeup-title-row">
          <p className="writeup-title">{item.title}</p>
          <ExternalLink size={12} className="writeup-ext-icon" />
        </div>

        <div className="writeup-meta">
          {item.source && (
            <span className="writeup-source-pill">{item.source}</span>
          )}
          {item.author && (
            <span className="writeup-meta-item">
              <User size={11} />
              <span>{item.author}</span>
            </span>
          )}
          {item.pubDate && (
            <>
              <span className="writeup-dot">·</span>
              <span className="writeup-meta-item">
                <Clock size={11} />
                <span>{timeAgo(item.pubDate)}</span>
              </span>
            </>
          )}
          {item.bounty && (
            <span className="writeup-bounty-badge">
              <DollarSign size={10} />
              <span>{item.bounty}</span>
            </span>
          )}
        </div>

        {item.categories?.length > 0 && (
          <div className="writeup-tags">
            {item.categories.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                <Tag size={9} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export default function WriteupFeed() {
  const [settings] = useSettings();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSource, setActiveSource] = useState("all");

  const enabledSources = (settings?.feedSources || []).filter((s) => s.enabled);
  const sourcesKey = enabledSources.map((s) => `${s.id}:${s.url}`).join("|");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function loadFeeds() {
      if (enabledSources.length === 0) {
        if (isMounted) {
          setItems([]);
          setLoading(false);
        }
        return;
      }

      const fetchPromises = enabledSources.map(async (source) => {
        try {
          if (source.type === "pentesterland") {
            const res = await fetch(source.url);
            if (!res.ok) return [];
            const data = await res.json();
            const list = Array.isArray(data.data) ? data.data : data;

            // Take the 30 most recent entries from Pentester Land database
            return list.slice(0, 30).map((entry, idx) => ({
              id: `pl-${idx}-${entry.AddedDate || entry.PublicationDate}`,
              title: entry.Links?.[0]?.Title || "Bug Bounty Write-Up",
              link: entry.Links?.[0]?.Link || "https://pentester.land",
              author: entry.Authors?.join(", ") || "Researcher",
              pubDate: entry.PublicationDate || entry.AddedDate,
              categories: entry.Bugs || [],
              bounty:
                entry.Bounty && entry.Bounty !== "-" ? entry.Bounty : null,
              thumbnail: null,
              sourceId: source.id,
              source: source.label,
            }));
          } else {
            // Standard RSS via rss2json
            const res = await fetch(
              `${RSS_PROXY}${encodeURIComponent(source.url)}`,
            );
            if (!res.ok) return [];
            const data = await res.json();
            if (data.status !== "ok" || !Array.isArray(data.items)) return [];

            return data.items.map((item) => ({
              id: item.guid || item.link,
              title: item.title,
              link: item.link,
              author: item.author || source.label,
              pubDate: item.pubDate,
              categories: item.categories || [],
              bounty: null,
              thumbnail: item.thumbnail || null,
              sourceId: source.id,
              source: source.label,
            }));
          }
        } catch {
          return [];
        }
      });

      const results = await Promise.allSettled(fetchPromises);
      if (!isMounted) return;

      const combined = [];
      const seen = new Set();

      for (const res of results) {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
          for (const item of res.value) {
            if (item.link && !seen.has(item.link)) {
              seen.add(item.link);
              combined.push(item);
            }
          }
        }
      }

      // Sort by newest publication date first
      combined.sort((a, b) => {
        const timeA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const timeB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return timeB - timeA;
      });

      if (combined.length === 0) {
        setError(
          "No writeups found. Check your selected feeds or internet connection.",
        );
      }

      setItems(combined);
      setLoading(false);
    }

    loadFeeds();

    return () => {
      isMounted = false;
    };
  }, [sourcesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const cardCount = settings?.cardCount || 20;

  // Group items by sourceId
  const groupedBySource = {};
  for (const item of items) {
    if (!groupedBySource[item.sourceId]) {
      groupedBySource[item.sourceId] = [];
    }
    groupedBySource[item.sourceId].push(item);
  }

  return (
    <div className="feed">
      {/* Feed Top Header */}
      <div className="feed-header">
        <div className="feed-title-wrap">
          <Rss size={14} className="feed-header-icon" />
          <span className="feed-title">
            <span className="feed-title-main">{"// bug bounty writeups"}</span>
            <span className="feed-title-sub">{" · how others got bounties while you slept"}</span>
          </span>
        </div>
        <span className="feed-source">
          {enabledSources.length} source{enabledSources.length !== 1 ? "s" : ""}{" "}
          streaming
        </span>
      </div>

      {/* Source Division Tabs */}
      {enabledSources.length > 1 && !loading && (
        <div className="feed-source-tabs">
          <button
            type="button"
            className={`feed-source-tab ${
              activeSource === "all" ? "active" : ""
            }`}
            onClick={() => setActiveSource("all")}
          >
            <Layers size={12} />
            <span>All Sources</span>
            <span className="source-tab-badge">{items.length}</span>
          </button>
          {enabledSources.map((source) => {
            const count = (groupedBySource[source.id] || []).length;
            return (
              <button
                key={source.id}
                type="button"
                className={`feed-source-tab ${
                  activeSource === source.id ? "active" : ""
                }`}
                onClick={() => setActiveSource(source.id)}
              >
                <span>{source.label}</span>
                {count > 0 && <span className="source-tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {loading && (
        <div className="feed-status">
          <span className="blink">█</span> intercepting latest writeups from the matrix...
        </div>
      )}

      {error && !loading && (
        <div className="feed-status feed-error">
          [ERR] {error} · (maybe the server needs more coffee)
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="feed-status">
          No feeds enabled. Open Settings ⚙ to feed your brain with fresh exploits.
        </div>
      )}

      {/* Feed Content divided by sources */}
      {!loading && !error && items.length > 0 && (
        <div className="feed-content-divisions">
          {activeSource === "all" ? (
            /* Render each source as its own dedicated section */
            enabledSources.map((source) => {
              const sourceItems = groupedBySource[source.id] || [];
              if (sourceItems.length === 0) return null;
              const displayed = sourceItems.slice(0, cardCount);

              return (
                <section key={source.id} className="feed-source-group">
                  <div className="feed-source-group-header">
                    <div className="feed-source-group-title">
                      <span className="feed-source-group-prefix">{"//"}</span>
                      <span className="feed-source-group-name">
                        {source.label}
                      </span>
                    </div>
                    <span className="feed-source-group-badge">
                      {sourceItems.length} writeup
                      {sourceItems.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="feed-grid">
                    {displayed.map((item) => (
                      <WriteupCard key={item.id || item.link} item={item} />
                    ))}
                  </div>
                </section>
              );
            })
          ) : (
            /* Render single selected source section */
            <section className="feed-source-group">
              <div className="feed-source-group-header">
                <div className="feed-source-group-title">
                  <span className="feed-source-group-prefix">{"//"}</span>
                  <span className="feed-source-group-name">
                    {enabledSources.find((s) => s.id === activeSource)?.label ||
                      activeSource}
                  </span>
                </div>
                <span className="feed-source-group-badge">
                  {(groupedBySource[activeSource] || []).length} writeup
                  {(groupedBySource[activeSource] || []).length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="feed-grid">
                {(groupedBySource[activeSource] || [])
                  .slice(0, cardCount)
                  .map((item) => (
                    <WriteupCard key={item.id || item.link} item={item} />
                  ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
