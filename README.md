# HackerTab

A clean, dark new-tab page for security folks, bug bounty hunters, and developers who spend too much time reading writeups and searching Shodan.

Inspired by the dark navy + cyan aesthetic of [HackTricks](https://book.hacktricks.xyz).

---

## What is this?

Default browser new-tab pages are usually filled with generic news, sponsored shortcuts, or blank space. HackerTab replaces that with things you might actually use every day:

- **Security & Bug Bounty Feed**: Fresh writeups aggregated from Pentester Land (with bounty amounts when available), InfoSec Writeups, PortSwigger Research, and Intigriti Bug Bytes.
- **Search with Engine Switching**: Quickly search Google, DuckDuckGo, Shodan, or GitHub, with live keyboard-friendly autocomplete suggestions.
- **Fast Bookmarking**: Pinned targets with automatic website favicons. Press <kbd>B</kbd> or type `bm <url>` in the search bar to stash a link in a second.
- **Slide-Out Scratchpad (`scratchpad.txt`)**: A sleek slide-out notes drawer accessible from the top bar or via <kbd>N</kbd> for IP addresses, flags, reverse shells, payloads, or quick to-dos. Auto-saves locally on every keystroke, with 1-click copy, timestamp insertion, export to .txt, and stats.
- **Connection Ping & Clock**: Time, date, and a quick network latency check so you know if your Wi-Fi or VPN dropped.
- **Customizable**: Dark navy HackTricks theme by default, with accent colors, monospace/sans fonts, engine defaults, and feeds you can toggle on or off in Settings.

---

## Quick Shortcuts

| Key | Action |
| --- | --- |
| <kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd> | Focus search bar |
| <kbd>Tab</kbd> in Search | Cycle search engines (when input empty) or complete suggestion |
| <kbd>Alt</kbd>+<kbd>1</kbd>–<kbd>4</kbd> | Direct switch: Google, DuckDuckGo, Shodan, GitHub |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Navigate search suggestions and matching bookmarks |
| <kbd>Enter</kbd> in Search | Search active engine (or stash a `bm <url>`) |
| <kbd>Alt</kbd>+<kbd>B</kbd> or <kbd>B</kbd> | Open quick-add bookmark popup (Alt+B works inside search bar) |
| <kbd>Alt</kbd>+<kbd>N</kbd> or <kbd>N</kbd> | Toggle scratchpad slide-out drawer (Alt+N works inside search bar) |
| <kbd>Alt</kbd>+<kbd>,</kbd> or <kbd>,</kbd> | Toggle Settings drawer (Alt+, works inside search bar) |
| <kbd>Alt</kbd>+<kbd>?</kbd> or <kbd>?</kbd> | Show keyboard shortcuts cheat sheet (Alt+? works inside search bar) |
| <kbd>Esc</kbd> | Close active modal, drawer, or dropdown |

---

## Getting Started

### Run locally

1. **Clone the repo and install dependencies**:
   ```bash
   git clone https://github.com/your-username/new_tab.git
   cd new_tab
   npm install
   ```

2. **Start the local server**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

---

## Using it as your browser new tab

1. Build the project:
   ```bash
   npm run build
   ```
2. You can:
   - Host the `build` folder on Vercel, Cloudflare Pages, GitHub Pages, or a local static server.
   - Use a browser extension like **Custom New Tab URL** (Chrome/Brave/Edge) or **New Tab Override** (Firefox) and point it to your URL (e.g. `http://localhost:3000`).

---

## Project Structure

```
src/
├── components/
│   ├── Bookmarks.jsx             # Sidebar links + quick-add trigger
│   ├── BookmarkIcon.jsx          # Auto website favicons & fallback icons
│   ├── QuickAddBookmarkModal.jsx # Fast bookmarking dialog (shortcut: B)
│   ├── Scratchpad.jsx            # In-tab notes buffer & scratchpad (shortcut: N)
│   ├── Scratchpad.css
│   ├── SearchBar.jsx             # Search bar (Google, DDG, Shodan, GitHub)
│   ├── WriteupFeed.jsx           # Bug bounty writeups & research feed
│   ├── Clock.jsx                 # Header time & date
│   ├── Greeting.jsx              # Greeting & connection latency check
│   └── Settings.jsx              # Settings drawer (themes, feeds, search)
├── context/
│   └── SettingsContext.jsx       # Persistent settings in localStorage
├── utils/
│   ├── bookmarkUtils.js          # URL normalization & domain extraction
│   └── searchSuggestions.js      # Search autocomplete fetcher
└── App.js                        # Main layout
```

---

## License

MIT
