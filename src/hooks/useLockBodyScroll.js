import { useEffect } from "react";

let lockCount = 0;
let originalOverflow = "";
let originalPaddingRight = "";

/**
 * Custom hook to lock body scrolling when modals, sheets, or drawers are open.
 * Supports multiple concurrent modals with reference counting and prevents layout shift
 * by compensating for desktop scrollbar width.
 *
 * @param {boolean} lock - Whether scroll should be locked
 */
export function useLockBodyScroll(lock = true) {
  useEffect(() => {
    if (!lock || typeof document === "undefined") return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      // Compensate for scrollbar disappearing to prevent horizontal page jump on desktop
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.classList.remove("modal-open");
      }
    };
  }, [lock]);
}

export default useLockBodyScroll;

