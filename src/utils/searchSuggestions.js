let callbackCounter = 0;

/**
 * Fetches search autocomplete suggestions via JSONP with automatic cleanup and timeout.
 * @param {string} query - The search query
 * @param {AbortSignal} [signal] - Optional abort signal
 * @returns {Promise<string[]>} List of suggestion strings
 */
export function fetchGoogleSuggestions(query, signal) {
  const clean = query?.trim();
  if (!clean) return Promise.resolve([]);

  return new Promise((resolve) => {
    const callbackId = `__jsonp_suggest_${Date.now()}_${++callbackCounter}`;
    const script = document.createElement("script");

    const cleanup = () => {
      try {
        delete window[callbackId];
      } catch {
        window[callbackId] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    const timeout = setTimeout(() => {
      cleanup();
      resolve([]);
    }, 2000);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        cleanup();
        resolve([]);
      });
    }

    window[callbackId] = (data) => {
      clearTimeout(timeout);
      cleanup();
      if (Array.isArray(data) && Array.isArray(data[1])) {
        // data[1] contains list of suggestion strings
        resolve(data[1].slice(0, 7));
      } else {
        resolve([]);
      }
    };

    script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
      clean
    )}&jsonp=${callbackId}`;
    script.async = true;
    script.onerror = () => {
      clearTimeout(timeout);
      cleanup();
      resolve([]);
    };

    document.head.appendChild(script);
  });
}

