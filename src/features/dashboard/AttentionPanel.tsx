import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProjectWithStats } from '../../types';
import { formatDate } from '../../lib/dates';
import { ProgressBar } from '../../components/ui/ProgressBar';

interface AttentionPanelProps {
  projects: ProjectWithStats[];
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 shadow-xs animate-in fade-in duration-300">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400 rounded-lg">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            Needs Attention ({projects.length})
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Campaigns approaching deadline with low completion or past end date.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {projects.map(({ project, stats, needsAttention }) => (
          <div
            key={project.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200/70 dark:border-amber-900/40 p-4 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm line-clamp-1"
                >
                  {project.title}
                </Link>
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  {needsAttention.reason}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Ends: {formatDate(project.end_date)} · {stats.total_completed} of {stats.total_planned} completed
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex-1">
                <ProgressBar
                  progressPct={stats.progress_pct}
                  totalPlanned={stats.total_planned}
                  totalCompleted={stats.total_completed}
                  size="sm"
                />
              </div>
              <Link
                to={`/projects/${project.id}`}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 shrink-0"
              >
                Review <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
