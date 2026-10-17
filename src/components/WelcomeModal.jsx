import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSettings } from "../context/SettingsContext";
import { Sparkles, ArrowRight } from "lucide-react";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import "./WelcomeModal.css";

const WELCOME_STORAGE_KEY = "hacker_tab_welcomed";

export default function WelcomeModal() {
  const [settings, updateSetting] = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  // Lock background scrolling while welcome modal is open
  useLockBodyScroll(isOpen);

  useEffect(() => {
    // Check if the user has already completed or dismissed onboarding
    const hasWelcomed = localStorage.getItem(WELCOME_STORAGE_KEY);

    if (!hasWelcomed) {
      // If user already configured a custom name that isn't the default "hacker", don't badger them
      if (settings?.greetingName && settings.greetingName !== "hacker") {
        try {
          localStorage.setItem(WELCOME_STORAGE_KEY, "true");
        } catch {}
        return;
      }
      setIsOpen(true);
    }
  }, [settings?.greetingName]);

  // Focus the text input when the modal appears
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Allow closing via Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (cleanName) {
      updateSetting("greetingName", cleanName);
    }
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    } catch {}
    setIsOpen(false);
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    } catch {}
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="welcome-backdrop"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-icon-badge" aria-hidden="true">
          <Sparkles size={24} />
        </div>

        <h2 id="welcome-modal-title" className="welcome-title">
          Welcome to your new tab
        </h2>

        <p className="welcome-description">
          What should we call you? We'll use your name to personalize your daily greetings.
        </p>

        <form onSubmit={handleSave} className="welcome-form">
          <div className="welcome-input-group">
            <label htmlFor="welcome-name-input" className="welcome-label">
              Your name or nickname
            </label>
            <input
              id="welcome-name-input"
              ref={inputRef}
              type="text"
              className="welcome-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Trinity, ZeroCool, or your real name..."
              maxLength={24}
              autoComplete="given-name"
            />
          </div>

          <div className="welcome-actions">
            <button type="submit" className="welcome-btn-primary">
              <span>{name.trim() ? "Continue" : "Continue as hacker"}</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="welcome-btn-skip"
              onClick={handleDismiss}
            >
              Skip for now
            </button>
          </div>

          <p className="welcome-hint">
            You can always change your name anytime in Settings.
          </p>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
