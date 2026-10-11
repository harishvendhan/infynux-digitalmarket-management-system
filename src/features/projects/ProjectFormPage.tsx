import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProjectForm } from './ProjectForm';
import { useProject, useCreateProject, useUpdateProject } from './useProjects';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import type { ProjectFormData } from '../../lib/schemas';

export const ProjectFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { data: projectItem, isLoading } = useProject(id);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: ProjectFormData) => {
    setErrorMessage(null);
    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, formData: data });
        navigate(`/projects/${id}`);
      } else {
        const created = await createMutation.mutateAsync(data);
        navigate(`/projects/${created.id}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to save project. Please check dates and fields.');
      }
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to={isEditing && id ? `/projects/${id}` : '/projects'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to {isEditing ? 'project' : 'projects'}
      </Link>

      <PageHeader
        title={isEditing ? 'Edit Project' : 'Create New Project'}
        description={
          isEditing
            ? `Updating campaign schedule and deliverable targets for ${projectItem?.project.title || 'project'}.`
            : 'Define client campaign dates, weekly schedule targets, and deliverable quotas.'
        }
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <ProjectForm
          isEditing={isEditing}
          initialValues={projectItem?.project}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};
