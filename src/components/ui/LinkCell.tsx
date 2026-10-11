import React from 'react';
import {
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  ExternalLink,
  Globe,
  Share2,
} from 'lucide-react';
import { detectPlatform, formatUrlDisplay, isValidHttpUrl } from '../../lib/urls';

interface LinkCellProps {
  url: string | null | undefined;
  className?: string;
  showText?: boolean;
}

export const LinkCell: React.FC<LinkCellProps> = ({
  url,
  className = '',
  showText = true,
}) => {
  if (!url || !isValidHttpUrl(url)) {
    return <span className="text-xs text-slate-400 dark:text-slate-500 italic">No link</span>;
  }

  const platform = detectPlatform(url);

  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600 shrink-0" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-600 shrink-0" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700 shrink-0" />;
      case 'tiktok':
        return <Share2 className="w-4 h-4 text-slate-900 dark:text-slate-100 shrink-0" />;
      default:
        return <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-medium group transition-colors ${className}`}
      title={url}
    >
      {getPlatformIcon()}
      {showText && <span>{formatUrlDisplay(url, 24)}</span>}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};
