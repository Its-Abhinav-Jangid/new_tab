import { useState } from "react";
import {
  BookOpen,
  Shield,
  Terminal,
  Search,
  Flame,
  Radio,
  Cpu,
  Link as LinkIcon,
  Bug,
  Zap,
  Key,
  Globe,
  FileText,
  FlaskConical,
  Crosshair,
  Code,
  Database,
  Server,
  Wifi,
  Lock,
  Bookmark,
} from "lucide-react";

export const BOOKMARK_ICONS = {
  favicon: Globe, // Special key for website favicon (fallback to Globe)
  Link: LinkIcon,
  Bookmark,
  Terminal,
  Shield,
  Bug,
  Search,
  BookOpen,
  Flame,
  Radio,
  Cpu,
  Zap,
  Key,
  Globe,
  FileText,
  FlaskConical,
  Crosshair,
  Code,
  Database,
  Server,
  Wifi,
  Lock,
};

export const AVAILABLE_BOOKMARK_ICONS = Object.keys(BOOKMARK_ICONS);

export function getFaviconUrl(url) {
  if (!url) return null;
  try {
    const raw =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;
    const parsed = new URL(raw);
    if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      parsed.hostname,
    )}&sz=64`;
  } catch {
    return null;
  }
}

export default function BookmarkIcon({
  name,
  url,
  size = 15,
  className = "",
}) {
  const [errorUrl, setErrorUrl] = useState(null);

  // If favicon mode is selected and a valid URL is provided
  const isFaviconMode = name === "favicon" || name === "auto";
  const hasError = errorUrl && errorUrl === url;

  if (isFaviconMode && url && !hasError) {
    const faviconSrc = getFaviconUrl(url);
    if (faviconSrc) {
      return (
        <img
          src={faviconSrc}
          alt=""
          width={size}
          height={size}
          className={`bookmark-favicon-img ${className}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "3px",
            objectFit: "contain",
            display: "inline-block",
            verticalAlign: "middle",
          }}
          onError={() => setErrorUrl(url)}
        />
      );
    }
  }

  const IconComponent =
    BOOKMARK_ICONS[name] || (name === "favicon" ? Globe : BOOKMARK_ICONS.Link);
  return <IconComponent size={size} className={className} />;
}

