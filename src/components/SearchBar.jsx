import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Terminal, CornerDownLeft } from 'lucide-react';
import './SearchBar.css';

const ENGINES = [
  { label: 'Google',     prefix: 'https://google.com/search?q=' },
  { label: 'DuckDuckGo', prefix: 'https://duckduckgo.com/?q=' },
  { label: 'Shodan',     prefix: 'https://www.shodan.io/search?query=' },
  { label: 'GitHub',     prefix: 'https://github.com/search?q=' },
];

export default function SearchBar() {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState(settings?.defaultEngine ?? 0);

  useEffect(() => {
    if (settings?.defaultEngine !== undefined) {
      setEngine(settings.defaultEngine);
    }
  }, [settings?.defaultEngine]);

  function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const selected = ENGINES[engine] || ENGINES[0];
    window.open(selected.prefix + encodeURIComponent(query), '_blank');
    setQuery('');
  }

  return (
    <form className="search-form" onSubmit={handleSearch}>
      {/* Engine picker */}
      <div className="search-engines">
        {ENGINES.map((e, i) => (
          <button
            key={e.label}
            type="button"
            className={`engine-btn ${i === engine ? 'active' : ''}`}
            onClick={() => setEngine(i)}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="search-row">
        <span className="search-prompt">
          <Terminal size={15} />
        </span>
        <input
          className="search-input"
          type="text"
          placeholder={`Search ${ENGINES[engine]?.label || 'web'}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button className="search-submit" type="submit" title="Search">
          <CornerDownLeft size={15} />
        </button>
      </div>
    </form>
  );
}
