import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProjectList } from './ProjectList';
import { useProjects } from './useProjects';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectListPage: React.FC = () => {
  const { data: projectItems, isLoading } = useProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage all client marketing campaigns, week schedules, and content targets."
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

      <ProjectList items={projectItems || []} isLoading={isLoading} />
    </div>
  );
};
