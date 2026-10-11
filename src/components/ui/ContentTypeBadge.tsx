import React from 'react';
import type { ContentType } from '../../types';
import { Film, FileText, Video as VideoIcon } from 'lucide-react';

interface ContentTypeBadgeProps {
  type: ContentType;
  showIcon?: boolean;
  className?: string;
}

export const ContentTypeBadge: React.FC<ContentTypeBadgeProps> = ({
  type,
  showIcon = true,
  className = '',
}) => {
  const getConfig = () => {
    switch (type) {
      case 'reel':
        return {
          label: 'Reel',
          icon: Film,
          classes: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
        };
      case 'post':
        return {
          label: 'Post',
          icon: FileText,
          classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        };
      case 'video':
        return {
          label: 'Video',
          icon: VideoIcon,
          classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        };
      default:
        return {
          label: type,
          icon: FileText,
          classes: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${config.classes} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
