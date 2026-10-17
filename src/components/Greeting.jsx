import { useState, useEffect, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import useDelayedUnmount from "../hooks/useDelayedUnmount";
import "./Greeting.css";

const WITTY_ONLINE_QUOTES = [
  "caffeine levels nominal · ready to break things responsibly",
  "there's no place like 127.0.0.1",
  "it's not a bug, it's an undocumented security feature",
  "sudo make me coffee · 0 exploits detected in cup",
  "drink water, fix that syntax error, hack the planet",
  "why do programmers prefer dark mode? light attracts bugs",
  "never trust a computer you can't throw out a window",
  "keyboard ready · fingers warm · ready to query the void",
  "remember to lock your screen before grabbing snacks",
  "404: social battery not found · running on pure caffeine",
  "pro tip: backups only exist once you've successfully restored them",
];

const WITTY_OFFLINE_QUOTES = [
  "no internet · time to actually read RFC 1149 (IP over Avian Carriers)",
  "offline · did someone trip over the router cable again?",
  "network down · step outside and enjoy the ultra-high-res graphics",
  "no connection · the simulation is buffering",
];

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good evening";
}

export default function Greeting() {
  const [settings] = useSettings();
  const enableNetworkCheck = settings?.enableNetworkCheck ?? true;
  const [salutation, setSalutation] = useState(getTimeGreeting);
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * WITTY_ONLINE_QUOTES.length),
  );
  const [networkStatus, setNetworkStatus] = useState({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    latency: null,
    checking: false,
  });

  const checkNetwork = useCallback(async () => {
    if (!enableNetworkCheck) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setNetworkStatus({ online: false, latency: null, checking: false });
      return;
    }

    setNetworkStatus((prev) => ({ ...prev, checking: true }));

    const start = performance.now();
    try {
      // Fast ping check with no-cors and cache busting
      await fetch(`https://www.google.com/favicon.ico?_=${Date.now()}`, {
        mode: "no-cors",
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });
      const rtt = Math.max(1, Math.round(performance.now() - start));
      setNetworkStatus({ online: true, latency: rtt, checking: false });
    } catch {
      // Secondary fallback check if Google favicon is blocked by an adblocker
      try {
        const start2 = performance.now();
        await fetch(`https://cloudflare.com/cdn-cgi/trace?_=${Date.now()}`, {
          mode: "no-cors",
          cache: "no-store",
          signal: AbortSignal.timeout(3500),
        });
        const rtt2 = Math.max(1, Math.round(performance.now() - start2));
        setNetworkStatus({ online: true, latency: rtt2, checking: false });
      } catch {
        setNetworkStatus({ online: false, latency: null, checking: false });
      }
    }
  }, [enableNetworkCheck]);

  useEffect(() => {
    if (enableNetworkCheck) {
      checkNetwork();
    }

    const handleOnline = () => {
      if (enableNetworkCheck) checkNetwork();
      else setNetworkStatus({ online: true, latency: null, checking: false });
    };
    const handleOffline = () => {
      setNetworkStatus({ online: false, latency: null, checking: false });
    };
    const handleFocus = () => {
      if (enableNetworkCheck) checkNetwork();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (enableNetworkCheck) {
      window.addEventListener("focus", handleFocus);
    }

    // Periodic check every 30s only if enabled
    let netInterval = null;
    if (enableNetworkCheck) {
      netInterval = setInterval(checkNetwork, 30000);
    }

    // Update salutation every minute
    const salutationInterval = setInterval(() => {
      setSalutation(getTimeGreeting());
    }, 60000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (enableNetworkCheck) {
        window.removeEventListener("focus", handleFocus);
      }
      if (netInterval) clearInterval(netInterval);
      clearInterval(salutationInterval);
    };
  }, [enableNetworkCheck, checkNetwork]);

  const showGreeting = settings?.showGreeting ?? true;
  const greetingAnim = useDelayedUnmount(showGreeting, 220);
  const hudPillAnim = useDelayedUnmount(enableNetworkCheck, 220);
  const greetingName = settings?.greetingName || "hacker";

  if (!greetingAnim.shouldRender) return null;

  const isOnline = !enableNetworkCheck || networkStatus.online;
  const isChecking = networkStatus.checking;
  const latency = networkStatus.latency;

  const quoteList = isOnline ? WITTY_ONLINE_QUOTES : WITTY_OFFLINE_QUOTES;
  const activeQuote = quoteList[quoteIndex % quoteList.length];
  const cycleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % quoteList.length);
  };

  return (
    <div className={`greeting-container ${greetingAnim.animClass}`}>
      {/* Real Network Status HUD Tag (only if enabled) */}
      {hudPillAnim.shouldRender && (
        <button
          type="button"
          className={`greeting-hud-pill ${isOnline ? "online" : "offline"} ${
            isChecking ? "checking" : ""
          } ${hudPillAnim.animClass}`}
          onClick={checkNetwork}
          title="Click to re-verify network connectivity"
        >
          <span
            className={`greeting-live-dot ${
              isOnline ? "online" : "offline"
            } ${isChecking ? "checking" : ""}`}
          aria-hidden="true"
        />
        <span className="greeting-hud-system">
          {isChecking
            ? "NETWORK // CHECKING..."
            : isOnline
              ? "NETWORK // ONLINE"
              : "NETWORK // OFFLINE"}
        </span>
        {isOnline && latency !== null && (
          <>
            <span className="greeting-hud-sep" aria-hidden="true">
              |
            </span>
            <span className="greeting-hud-latency">{latency}ms</span>
          </>
        )}
        {!isOnline && !isChecking && (
          <>
            <span className="greeting-hud-sep" aria-hidden="true">
              |
            </span>
            <span className="greeting-hud-offline-tag">DISCONNECTED</span>
          </>
        )}
      </button>
      )}

      {/* Main Hero Title */}
      <h1 className="greeting-title">
        <span className="greeting-prompt" aria-hidden="true">
          &gt;&nbsp;
        </span>
        <span className="greeting-salutation">{salutation},&nbsp;</span>
        <span className="greeting-name">{greetingName}</span>
        <span className="greeting-cursor" aria-hidden="true">
          _
        </span>
      </h1>

      {/* Subline Terminal Comment with interactive witty quote cycling */}
      <button
        type="button"
        className="greeting-sub"
        onClick={cycleQuote}
        title="Click for another thought ↻"
      >
        <span className="greeting-sub-text">{`// ${activeQuote}`}</span>
      </button>
    </div>
  );
}
