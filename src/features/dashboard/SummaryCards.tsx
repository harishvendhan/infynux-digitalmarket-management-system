import React from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  FolderKanban,
  Activity,
  CheckCircle2,
  Film,
  FileText,
  Video,
} from 'lucide-react';
import type { DashboardStatsView } from '../../types';

interface SummaryCardsProps {
  stats: DashboardStatsView;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Projects"
        value={stats.total_projects}
        subtitle="All campaigns in workspace"
        icon={<FolderKanban className="w-5 h-5 text-indigo-600" />}
      />
      <StatCard
        title="Active Projects"
        value={stats.active_projects}
        subtitle="Currently in progress"
        icon={<Activity className="w-5 h-5 text-blue-600" />}
      />
      <StatCard
        title="Completed Projects"
        value={stats.completed_projects}
        subtitle="Successfully delivered"
        icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
      />
      <StatCard
        title="Total Reels Completed"
        value={stats.total_reels_completed}
        subtitle="Published reels across projects"
        icon={<Film className="w-5 h-5 text-purple-600" />}
      />
      <StatCard
        title="Total Posts Completed"
        value={stats.total_posts_completed}
        subtitle="Published posts across projects"
        icon={<FileText className="w-5 h-5 text-blue-600" />}
      />
      <StatCard
        title="Total Videos Completed"
        value={stats.total_videos_completed}
        subtitle="Published videos across projects"
        icon={<Video className="w-5 h-5 text-amber-600" />}
      />
    </div>
  );
};
