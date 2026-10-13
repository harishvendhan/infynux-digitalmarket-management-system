import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { SummaryCards } from './SummaryCards';
import { AttentionPanel } from './AttentionPanel';
import { ProjectList } from '../projects/ProjectList';
import { useDashboardStats, useProjects } from '../projects/useProjects';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { stats, attentionProjects, isLoading: isStatsLoading } = useDashboardStats();
  const { data: projectItems, isLoading: isProjectsLoading } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agency Dashboard"
        description="Monitor marketing campaigns, deliverables, and automated weekly schedules."
        action={
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </Link>
        }
      />

      {/* Six Summary Cards per Section 5.2 */}
      <SummaryCards stats={stats} isLoading={isStatsLoading} />

      {/* Needs Attention Panel per D6 (shown only when projects qualify) */}
      <AttentionPanel projects={attentionProjects} />

      {/* Project Directory Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Projects Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overview of active and completed marketing campaigns
            </p>
          </div>
        </div>

        <ProjectList
          items={projectItems || []}
          isLoading={isProjectsLoading}
        />
      </div>
    </div>
  );
};
