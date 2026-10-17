import { useSettings } from '../context/SettingsContext';
import BookmarkIcon from './BookmarkIcon';
import { Bookmark, ArrowRight } from 'lucide-react';
import './Bookmarks.css';

export default function Bookmarks() {
  const { settings } = useSettings();
  const bookmarks = settings?.bookmarks || [];

  return (
    <div className="bookmarks">
      <div className="bookmarks-header" title="Essential targets & frequently visited rabbit holes">
        <Bookmark size={12} className="bookmarks-header-icon" />
        <span>{'// quick links · digital stash'}</span>
      </div>
      <ul className="bookmarks-list">
        {bookmarks.map((bm) => (
          <li key={bm.id || bm.url}>
            <a
              className="bookmark-item"
              href={bm.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Teleport to ${bm.label}`}
            >
              <span className="bookmark-icon">
                <BookmarkIcon name={bm.icon} url={bm.url} size={15} />
              </span>
              <span className="bookmark-label">{bm.label}</span>
              <span className="bookmark-arrow">
                <ArrowRight size={13} />
              </span>
            </a>
          </li>
        ))}
        {bookmarks.length === 0 && (
          <li className="bookmarks-empty">
            {'// 404 links found · hit Settings ⚙ to stash your targets'}
          </li>
        )}
      </ul>
    </div>
  );
}
