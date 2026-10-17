import { useState, useEffect, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Greeting.css";

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 22) return "Good evening";
  return "Good evening";
}

export default function Greeting() {
  const [settings] = useSettings();
  const [salutation, setSalutation] = useState(getTimeGreeting);
  const [networkStatus, setNetworkStatus] = useState({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    latency: null,
    checking: false,
  });

  const checkNetwork = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    checkNetwork();

    const handleOnline = () => checkNetwork();
    const handleOffline = () => {
      setNetworkStatus({ online: false, latency: null, checking: false });
    };
    const handleFocus = () => checkNetwork();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);

    // Periodic check every 30s
    const netInterval = setInterval(checkNetwork, 30000);

    // Update salutation every minute
    const salutationInterval = setInterval(() => {
      setSalutation(getTimeGreeting());
    }, 60000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      clearInterval(netInterval);
      clearInterval(salutationInterval);
    };
  }, [checkNetwork]);

  const showGreeting = settings?.showGreeting ?? true;
  const greetingName = settings?.greetingName || "hacker";

  if (!showGreeting) return null;

  const isOnline = networkStatus.online;
  const isChecking = networkStatus.checking;
  const latency = networkStatus.latency;

  return (
    <div className="greeting-container">
      {/* Real Network Status HUD Tag */}
      <button
        type="button"
        className={`greeting-hud-pill ${isOnline ? "online" : "offline"} ${
          isChecking ? "checking" : ""
        }`}
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
            <span className="greeting-hud-sep" aria-hidden="true">|</span>
            <span className="greeting-hud-latency">{latency}ms</span>
          </>
        )}
        {!isOnline && !isChecking && (
          <>
            <span className="greeting-hud-sep" aria-hidden="true">|</span>
            <span className="greeting-hud-offline-tag">DISCONNECTED</span>
          </>
        )}
      </button>

      {/* Main Hero Title */}
      <h1 className="greeting-title">
        <span className="greeting-prompt" aria-hidden="true">&gt;&nbsp;</span>
        <span className="greeting-salutation">{salutation},&nbsp;</span>
        <span className="greeting-name">{greetingName}</span>
        <span className="greeting-cursor" aria-hidden="true">_</span>
      </h1>

      {/* Subline Terminal Comment */}
      <div className="greeting-sub">
        <span className="greeting-sub-text">
          {isOnline
            ? "// internet connected · ready to search"
            : "// no network connection · offline mode"}
        </span>
      </div>
    </div>
  );
}
