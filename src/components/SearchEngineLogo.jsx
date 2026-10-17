import { useState } from "react";

export function GoogleLogo({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.39 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function DuckDuckGoLogo({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="11" fill="#DE5833" />
      <path
        d="M16.5 12.2c-.3-.2-.7-.3-1.1-.3-.2-.2-.4-.5-.7-.6.4-.9.5-1.9.3-2.8-.3-1.5-1.5-2.6-3-2.8-.7-.1-1.5 0-2.1.4-.2-.1-.3-.1-.5-.1-.5 0-.9.3-1 .8-.6.2-1.1.5-1.4 1-.5.6-.7 1.4-.6 2.1 0 .5.2 1 .5 1.5-.2.3-.3.6-.3 1 0 .6.3 1.1.8 1.4 0 .3 0 .6 0 .9.1 1.2.8 2.2 1.9 2.6.5.2 1.1.3 1.7.3 1.3-.1 2.5-.9 3.1-2 .3-.5.4-1 .5-1.6.4-.1.8-.3 1.1-.7.3-.4.4-.9.3-1.4-.1-.3-.3-.6-.5-.8z"
        fill="#FFFFFF"
      />
      <circle cx="10" cy="9.8" r="0.9" fill="#222222" />
      <path
        d="M16.2 11.6c-.8 0-1.6.3-2.2.8.5.5 1.2.7 1.8.6.6 0 1.2-.2 1.5-.6-.3-.5-.7-.8-1.1-.8z"
        fill="#F9A01B"
      />
      <path
        d="M10.2 16.5c.4.6 1.2.9 1.9.9.7 0 1.4-.3 1.8-.9-.8-.2-1.7-.3-2.5-.2-.4.1-.8.1-1.2.2z"
        fill="#5B9E4D"
      />
    </svg>
  );
}

export function GitHubLogo({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function ShodanLogo({ size = 16, className = "" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="https://www.google.com/s2/favicons?domain=shodan.io&sz=64"
        alt="Shodan"
        width={size}
        height={size}
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "3px",
          objectFit: "contain",
          display: "inline-block",
          verticalAlign: "middle",
          flexShrink: 0,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="4" fill="#BA1A1A" />
      <path d="M6 7h12v3h-8v2h8v5H6v-3h8v-2H6V7z" fill="#FFFFFF" />
    </svg>
  );
}

export default function SearchEngineLogo({
  engine,
  size = 16,
  className = "",
}) {
  const name =
    typeof engine === "string"
      ? engine.toLowerCase()
      : (engine?.label || "").toLowerCase();

  if (name.includes("google")) {
    return <GoogleLogo size={size} className={className} />;
  }
  if (name.includes("duckduckgo")) {
    return <DuckDuckGoLogo size={size} className={className} />;
  }
  if (name.includes("github")) {
    return <GitHubLogo size={size} className={className} />;
  }
  if (name.includes("shodan")) {
    return <ShodanLogo size={size} className={className} />;
  }

  // Fallback
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: `${size}px`,
        height: `${size}px`,
        textAlign: "center",
        lineHeight: `${size}px`,
        fontSize: `${Math.round(size * 0.75)}px`,
        fontWeight: "bold",
      }}
    >
      🔍
    </span>
  );
}
