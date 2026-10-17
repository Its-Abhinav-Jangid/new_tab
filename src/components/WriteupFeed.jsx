import { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { Rss, User, Clock, ExternalLink, Tag } from "lucide-react";
import "./WriteupFeed.css";

const FEED_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://infosecwriteups.com/feed";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
        />
      )}
      <div className="writeup-body">
        <div className="writeup-title-row">
          <p className="writeup-title">{item.title}</p>
          <ExternalLink size={12} className="writeup-ext-icon" />
        </div>
        <div className="writeup-meta">
          <span className="writeup-meta-item">
            <User size={11} />
            <span>{item.author}</span>
          </span>
          <span className="writeup-dot">·</span>
          <span className="writeup-meta-item">
            <Clock size={11} />
            <span>{timeAgo(item.pubDate)}</span>
          </span>
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

  useEffect(() => {
    fetch(FEED_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "ok") setItems(data.items);
        else setError("Feed returned an error.");
      })
      .catch(() => setError("Failed to load feed. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  const cardCount = settings?.cardCount || 20;
  const displayedItems = items.slice(0, cardCount);

  return (
    <div className="feed">
      <div className="feed-header">
        <div className="feed-title-wrap">
          <Rss size={14} className="feed-header-icon" />
          <span className="feed-title">{"// infosec writeups"}</span>
        </div>
        <span className="feed-source">infosecwriteups.com</span>
      </div>

      {loading && (
        <div className="feed-status">
          <span className="blink">█</span> fetching writeups...
        </div>
      )}

      {error && <div className="feed-status feed-error">[ERR] {error}</div>}

      <div className="feed-grid">
        {displayedItems.map((item) => (
          <WriteupCard key={item.guid || item.link} item={item} />
        ))}
      </div>
    </div>
  );
}
