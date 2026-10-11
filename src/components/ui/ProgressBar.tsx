import React from 'react';

interface ProgressBarProps {
  progressPct: number | null;
  totalPlanned?: number;
  totalCompleted?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPct,
  totalPlanned,
  totalCompleted,
  showLabel = true,
  size = 'md',
  color = 'indigo',
  className = '',
}) => {
  if (progressPct === null || (totalPlanned !== undefined && totalPlanned === 0)) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div className="bg-slate-300 h-full w-0" />
        </div>
        {showLabel && <span className="text-xs font-medium text-slate-400">N/A</span>}
      </div>
    );
  }

  // Cap only visually at 100%, but keep real value for label
  const visualPct = Math.min(Math.max(progressPct, 0), 100);
  const isOverTarget = totalPlanned !== undefined && totalCompleted !== undefined && totalCompleted > totalPlanned;
  const overTargetDiff = isOverTarget && totalPlanned !== undefined && totalCompleted !== undefined ? totalCompleted - totalPlanned : 0;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const colorClasses = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        {showLabel && (
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {progressPct.toFixed(1)}%
          </span>
        )}
        {isOverTarget && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
            Over target (+{overTargetDiff})
          </span>
        )}
      </div>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${visualPct}%` }}
        />
      </div>
    </div>
  );
};
