# HackerTab

A clean, dark new-tab page for security folks, bug bounty hunters, and developers who spend too much time reading writeups and searching Shodan.

Inspired by the dark navy + cyan aesthetic of [HackTricks](https://book.hacktricks.xyz).

---

## What is this?

Default browser new-tab pages are usually filled with generic news, sponsored shortcuts, or blank space. HackerTab replaces that with things you might actually use every day:

- **Security & Bug Bounty Feed**: Fresh writeups aggregated from Pentester Land (with bounty amounts when available), InfoSec Writeups, PortSwigger Research, and Intigriti Bug Bytes.
- **HackerOne Report & Bounty Tracker**: Track submitted vulnerabilities, program targets, triage states (`triaged`, `resolved`, `needs-more-info`, `duplicate`), and total bounty earnings. Connects directly to the HackerOne Hacker API v1 via token, supports 1-click HackerOne CSV export imports, or manual logging. Switch views anytime with <kbd>Alt</kbd>+<kbd>R</kbd>.
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
| <kbd>Alt</kbd>+<kbd>R</kbd> or <kbd>R</kbd> | Toggle between Security Feed and HackerOne Reports |
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

## HackerOne Report & Bounty Tracker

HackerTab lets you track your submitted vulnerabilities, triage status, duplicates (dupes), and bounty payouts directly on your start page. Toggle between the Security Feed and your Reports anytime using the top switcher or by pressing <kbd>Alt</kbd>+<kbd>R</kbd> (or <kbd>R</kbd>).

### How to Connect

Because `api.hackerone.com` does not serve permissive CORS headers to standard browser origins, HackerTab supports multiple sync options in **Settings ⚙ → HackerOne**:

1. **Standard CORS Provider (Recommended for web usage)**:
   - **`corsproxy.io`**: Get a free API key at [console.corsproxy.io](https://console.corsproxy.io/), select `corsproxy.io` in Settings, and paste your key.
   - **`cors.sh`**: Get a key at [cors.sh](https://cors.sh/), select `cors.sh` in Settings, and paste your key.
2. **Custom Cloudflare Worker / Reverse Proxy**:
   - Select **Custom Proxy** and enter your endpoint URL (e.g. `https://my-proxy.workers.dev/?url=`) with optional custom authentication headers.
3. **Direct (Browser Extension)**:
   - If running as an unpacked browser extension with host permissions (`"host_permissions": ["https://api.hackerone.com/*"]`), select **Direct (No Proxy)**.
4. **1-Click CSV Import (No API token needed)**:
   - Export your reports list from [hackerone.com/bugs](https://hackerone.com/bugs) and click the **Upload (CSV)** button in HackerTab to populate your reports and stats instantly.
5. **Manual Logging**:
   - Click **Log Report** to track any vulnerability, target program, severity rating, and bounty amount manually.

---

## Project Structure

```
src/
├── components/
│   ├── Bookmarks.jsx             # Sidebar links + quick-add trigger
│   ├── BookmarkIcon.jsx          # Auto website favicons & fallback icons
│   ├── QuickAddBookmarkModal.jsx # Fast bookmarking dialog (shortcut: B)
│   ├── H1ReportsTracker.jsx      # HackerOne submissions & bounty tracker
│   ├── H1ReportModal.jsx         # Manual report add/edit dialog
│   ├── Scratchpad.jsx            # In-tab notes buffer & scratchpad (shortcut: N)
│   ├── SearchBar.jsx             # Search bar (Google, DDG, Shodan, GitHub)
│   ├── ShortcutsModal.jsx        # Keyboard shortcuts cheat sheet (shortcut: ?)
│   ├── WriteupFeed.jsx           # Bug bounty writeups & research feed
│   ├── Clock.jsx                 # Header time & date
│   ├── Greeting.jsx              # Greeting & connection latency check
│   └── Settings.jsx              # Settings drawer (themes, feeds, HackerOne, search)
├── context/
│   └── SettingsContext.jsx       # Persistent settings in localStorage
├── hooks/
│   └── useLockBodyScroll.js      # Modal & drawer background scroll locking
├── services/
│   └── hackeroneApi.js           # HackerOne API fetcher, CSV parser & CORS handler
├── utils/
│   ├── bookmarkUtils.js          # URL normalization & domain extraction
│   └── searchSuggestions.js      # Search autocomplete fetcher
└── App.js                        # Main layout & view switcher
```

---

## License

MIT
