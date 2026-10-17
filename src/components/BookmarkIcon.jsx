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
} from 'lucide-react';

export const BOOKMARK_ICONS = {
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

export default function BookmarkIcon({ name, size = 15, className = '' }) {
  const IconComponent = BOOKMARK_ICONS[name] || BOOKMARK_ICONS.Link;
  return <IconComponent size={size} className={className} />;
}
