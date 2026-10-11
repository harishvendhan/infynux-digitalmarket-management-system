import React from 'react';
import type { ProjectStatus, TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus;
  type?: 'project' | 'task';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'not_started':
        return {
          label: 'Not Started',
          dotColor: 'bg-slate-400',
          containerColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          dotColor: 'bg-blue-500',
          containerColor: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        };
      case 'on_hold':
        return {
          label: 'On Hold',
          dotColor: 'bg-amber-500',
          containerColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        };
      case 'completed':
        return {
          label: 'Completed',
          dotColor: 'bg-emerald-500',
          containerColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
        };
      case 'planned':
        return {
          label: 'Planned',
          dotColor: 'bg-slate-400',
          containerColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
      default:
        return {
          label: status,
          dotColor: 'bg-slate-400',
          containerColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.containerColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      <span>{config.label}</span>
    </span>
  );
};
