import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate, formatDuration } from '../../lib/dates';
import type { ProjectWithStats } from '../../types';
import { Edit3, Trash2, Calendar, Film, FileText, Video, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  item: ProjectWithStats;
  onDelete: (id: string, title: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ item, onDelete }) => {
  const { project, stats } = item;
  const durationLabel = formatDuration(project.start_date, project.end_date);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Title, Status and Action Buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Link
              to={`/projects/${project.id}`}
              className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 inline-flex items-center gap-1"
            >
              <span>{project.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status} />
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              to={`/projects/${project.id}/edit`}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit project"
              aria-label="Edit project"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDelete(project.id, project.title)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
              title="Delete project"
              aria-label="Delete project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Date range & duration */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>
            {formatDate(project.start_date)} – {formatDate(project.end_date)}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{durationLabel}</span>
        </div>

        {/* Planned vs Completed for Reels, Posts, and Videos */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100/60 dark:border-purple-900/50">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-0.5">
              <Film className="w-3 h-3" /> Reels
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stats.completed_reels} / {stats.planned_reels}
            </span>
          </div>

          <div className="p-2 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100/60 dark:border-blue-900/50">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 mb-0.5">
              <FileText className="w-3 h-3" /> Posts
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stats.completed_posts} / {stats.planned_posts}
            </span>
          </div>

          <div className="p-2 bg-amber-50/50 dark:bg-amber-950/30 rounded-xl border border-amber-100/60 dark:border-amber-900/50">
            <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 mb-0.5">
              <Video className="w-3 h-3" /> Videos
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {stats.completed_videos} / {stats.planned_videos}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Open Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <ProgressBar
          progressPct={stats.progress_pct}
          totalPlanned={stats.total_planned}
          totalCompleted={stats.total_completed}
          size="sm"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {stats.total_completed} of {stats.total_planned} completed
          </span>
          <Link
            to={`/projects/${project.id}`}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
          >
            Open Project &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
