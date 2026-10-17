import { useState, useEffect } from "react";

/**
 * Hook to keep a component mounted during its exit animation when toggled in settings.
 *
 * @param {boolean} isMounted - Whether the item is logically enabled/open
 * @param {number} delay - Duration of the exit animation in ms
 * @returns {{ shouldRender: boolean, isMounted: boolean, isExiting: boolean, animClass: string }}
 */
export default function useDelayedUnmount(isMounted, delay = 220) {
  const [shouldRender, setShouldRender] = useState(isMounted);

  useEffect(() => {
    let timeoutId;
    if (isMounted && !shouldRender) {
      setShouldRender(true);
    } else if (!isMounted && shouldRender) {
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, delay);
    }
    return () => clearTimeout(timeoutId);
  }, [isMounted, delay, shouldRender]);

  return {
    shouldRender,
    isMounted,
    isExiting: !isMounted && shouldRender,
    animClass: !isMounted && shouldRender ? "anim-disappear" : "anim-appear",
  };
}

