import { useState } from "react";
import "./App.css";
import { SettingsProvider } from "./context/SettingsContext";
import Clock from "./components/Clock";
import Greeting from "./components/Greeting";
import SearchBar from "./components/SearchBar";
import WriteupFeed from "./components/WriteupFeed";
import Bookmarks from "./components/Bookmarks";
import Settings from "./components/Settings";
import { Settings as SettingsIcon } from "lucide-react";

function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="app">
      {/* Top bar: clock + settings toggle */}
      <header className="app-header">
        <Clock />
        <button
          className="settings-gear"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          type="button"
        >
          <SettingsIcon size={18} />
        </button>
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
        <span className="footer-text">{'// hacker tab — stay sharp'}</span>
      </footer>

      {/* Settings drawer */}
      <Settings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
