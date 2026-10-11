import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { DailyTaskCard } from './DailyTaskCard';
import { useDailyTasks } from './useDailyTasks';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export const DailyTasksPage: React.FC = () => {
  const { stats } = useDailyTasks();

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Daily Tasks Checklist"
        description="Track and check off your day-to-day deliverables, shoots, edits, and client milestones."
      />

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <ListTodo className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold truncate">Total Tasks</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold truncate">Completed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 text-amber-600 dark:text-amber-400 mb-1">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold truncate">Pending</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-1.5 sm:gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold truncate">Completion</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.progressPct}%</p>
        </div>
      </div>

      {/* Main Checklist Card */}
      <DailyTaskCard />
    </div>
  );
};
