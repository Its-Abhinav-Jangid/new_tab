# HackerTab ⚡

> A cyberpunk, HackTricks-inspired developer & security researcher new tab dashboard built with React 19.

![HackerTab Preview](https://img.shields.io/badge/Theme-HackTricks%20Dark-7dcfff?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.3-39d353?style=for-the-badge&logo=react)
![Lucide](https://img.shields.io/badge/Icons-Lucide%20React-ff9e64?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-bb9af7?style=for-the-badge)

---

## 🚀 Overview

**HackerTab** transforms your browser's new tab page into a high-performance command center tailored for penetration testers, bug bounty hunters, security researchers, and developers. Featuring a dark navy terminal aesthetic inspired by [HackTricks](https://book.hacktricks.xyz), real-time network verification, multi-source writeup aggregation, and omnibar search autocomplete.

---

## ✨ Features

### 1. 🛡️ Centerpiece Greeting & Real-Time Network Monitor
- **Cyberpunk Typography**: High-impact `Chakra Petch` display lettering with smooth ambient luminescence and an active terminal cursor (`_`).
- **Real Network Connectivity Check**: Actively measures round-trip latency (`ms`) using lightweight ping requests—not just static labels.
- **Dynamic Status Beacon**:
  - `● NETWORK // ONLINE · 24ms`: Green pulsing beacon and verified connectivity status.
  - `● NETWORK // OFFLINE · DISCONNECTED`: Red warning beacon when connection drops.
  - Interactive re-verification on click and automatic re-check on window focus.
- **Natural Salutations**: Context-aware greetings based on time of day (Morning, Afternoon, Evening).

### 2. 🔍 Omnibar Search with Autocomplete & Keyboard Navigation
- **Search Engine Switcher**: Quick-toggle brand icons for **Google**, **DuckDuckGo**, **Shodan**, and **GitHub**.
- **Real-Time Autocomplete Suggestions**: Fast, debounced query suggestions via JSONP with match highlighting.
- **Integrated Bookmark Launch**: Matching bookmarks from your pinned links automatically appear at the top of suggestions with a quick-launch shortcut.
- **Full Keyboard Navigation**:
  - <kbd>↓</kbd> / <kbd>↑</kbd>: Navigate through suggestions with automatic scrolling.
  - <kbd>Enter</kbd>: Execute search or launch selected bookmark.
  - <kbd>Tab</kbd>: Autocomplete the input with the selected suggestion.
  - <kbd>Esc</kbd>: Instantly dismiss the suggestions dropdown.

### 3. 📰 Multi-Source Bug Bounty Writeup Aggregator
- **Active Curated Sources**:
  - **Pentester Land Database**: Curated writeups with disclosed bounty badges (`💰 $X,XXX`) and bug classifications.
  - **InfoSec Writeups**: Deep-dive tutorials and vulnerability disclosures.
  - **Intigriti (Bug Bytes)**: Weekly security summaries and community highlights.
  - **PortSwigger Research**: Cutting-edge web security research and zero-day findings.
  - **tl;dr sec**: Curated AppSec and cloud security tooling feed.
- **Division by Source**: Filter writeups using top source tabs or view them neatly grouped by source sections (`// <Source Name>`).
- **Ellipsis Truncation**: Text boundaries with `word-break: break-word` and CSS multi-line clamp prevent cards from overflowing on mobile viewports.

### 4. 🔖 Pinned Hacker Bookmarks
- **Desktop Sidebar**: Pinned quick-links drawer with Lucide tech icons or auto-fetched high-resolution website favicons.
- **Mobile Horizontal Rail**: Automatically adapts on mobile screens into a touch-scrollable horizontal strip of bookmark pills placed directly beneath the search bar.
- **Full In-Place Management**:
  - Add bookmarks with custom labels and URLs.
  - **Favicon Auto-Fetch**: Automatically retrieves high-resolution website favicons via Google's favicon service with fallback to Lucide `Globe`.
  - **Edit Mode**: Edit existing bookmarks directly from settings with instant form pre-filling.

### 5. ⚙️ Slide-In Settings Drawer
- **Persistent Storage**: Synced to `localStorage` key `hacker_tab_settings` via an ergonomic `[settings, updateSetting] = useSettings()` hook.
- **Appearance Tab**:
  - Preset color palettes (HackTricks Cyan, Toxic Green, Purple, Red, Orange, Amber).
  - Integrated `@uiw/react-color` Sketch picker (commits color when closed to prevent unwanted state churn).
  - Font switch (`mono` vs `sans`), card density, and customizable hacker handle.
- **Clock Tab**: 12h/24h format, seconds toggle, date toggle.
- **Feed Tab**: Toggle individual bug bounty sources on/off.
- **Search Tab**: Default search engine selection with brand logos.
- **Bookmarks Tab**: Add, edit, remove, and manage quick-links.

### 6. 📱 100% Mobile Responsive
- Adaptive single-column layout on screens `<= 860px`.
- Mobile settings drawer expands to full-width sheet (`100vw`).
- Touch-friendly horizontal scrolling for bookmarks and source tabs.
- Fluid fluid typography (`clamp`) scaling down to 320px screens.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev)
- **Icons**: [Lucide React](https://lucide.dev)
- **Color Picker**: [@uiw/react-color](https://uiwjs.github.io/react-color/)
- **Typography**: `Chakra Petch` (Display) & `JetBrains Mono` (Monospace)
- **Styling**: Vanilla CSS variables with HackTricks theme palette

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/new_tab.git
   cd new_tab
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🧩 Setting as Your Browser New Tab

### Chrome / Chromium / Brave / Edge
1. Build the project:
   ```bash
   npm run build
   ```
2. Use an extension like **Custom New Tab URL** or load the folder as an unpacked browser extension.
3. Point your new tab URL to your deployed URL or local server (`http://localhost:3000`).

---

## 📂 Project Structure

```
new_tab/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── BookmarkIcon.jsx       # Lucide & auto-favicon resolver
│   │   ├── Bookmarks.jsx          # Quick-links sidebar & mobile rail
│   │   ├── Bookmarks.css
│   │   ├── Clock.jsx              # Header live clock & date
│   │   ├── Clock.css
│   │   ├── Greeting.jsx           # Centerpiece hero & real network monitor
│   │   ├── Greeting.css
│   │   ├── SearchBar.jsx          # Omnibar with autocomplete & keyboard nav
│   │   ├── SearchBar.css
│   │   ├── SearchEngineLogo.jsx   # Vector brand logos for engines
│   │   ├── Settings.jsx           # Slide-in drawer with 5 configuration tabs
│   │   ├── Settings.css
│   │   ├── WriteupFeed.jsx        # Multi-source bug bounty aggregator
│   │   └── WriteupFeed.css
│   ├── context/
│   │   └── SettingsContext.jsx    # Persistent settings hook & defaults
│   ├── utils/
│   │   └── searchSuggestions.js   # JSONP autocomplete fetcher
│   ├── App.js                     # Main shell layout
│   ├── index.css                  # HackTricks global design tokens
│   └── index.js
├── package.json
└── README.md
```

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
