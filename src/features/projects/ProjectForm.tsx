import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../../lib/schemas';
import { formatDuration, generateProjectWeeks } from '../../lib/dates';
import { AlertTriangle, Calendar, Layers, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectFormProps {
  initialValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
  isEditing?: boolean;
  errorMessage?: string | null;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  isEditing = false,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      start_date: initialValues?.start_date || '2026-10-01',
      end_date: initialValues?.end_date || '2026-12-31',
      planned_reels: initialValues?.planned_reels ?? 20,
      planned_posts: initialValues?.planned_posts ?? 15,
      planned_videos: initialValues?.planned_videos ?? 10,
      status: initialValues?.status || 'not_started',
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');
  const plannedReels = Number(watch('planned_reels') || 0);
  const plannedPosts = Number(watch('planned_posts') || 0);
  const plannedVideos = Number(watch('planned_videos') || 0);

  // Live calculation of duration and generated weeks (D7, D2)
  const durationLabel = useMemo(() => {
    return formatDuration(startDate, endDate);
  }, [startDate, endDate]);

  const generatedWeeks = useMemo(() => {
    return generateProjectWeeks(startDate, endDate);
  }, [startDate, endDate]);

  // Warning when all three planned counts are 0 (Section 5.3)
  const allZeroTargets = plannedReels === 0 && plannedPosts === 0 && plannedVideos === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Backend / Boundary error alert (e.g. D4 blocking error) */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs font-medium animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm">Cannot Update Dates</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Project Title *
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. Emirates Inn Digital Marketing"
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="Campaign goals, target audience, deliverables overview..."
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Dates and Duration Live Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Start Date *
          </label>
          <div className="relative">
            <input
              type="date"
              {...register('start_date')}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          {errors.start_date && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.start_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            End Date *
          </label>
          <div className="relative">
            <input
              type="date"
              {...register('end_date')}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          {errors.end_date && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      {/* Live duration & weeks indicator per Section 5.3 */}
      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/50 rounded-xl flex items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            Duration: <strong className="font-bold">{durationLabel}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            {generatedWeeks.length} weekly schedule{generatedWeeks.length === 1 ? '' : 's'} will be generated
          </span>
        </div>
      </div>

      {/* Planned Targets */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Planned Deliverables Targets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
              Planned Reels
            </label>
            <input
              type="number"
              min={0}
              step={1}
              {...register('planned_reels', { valueAsNumber: true })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.planned_reels && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.planned_reels.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
              Planned Posts
            </label>
            <input
              type="number"
              min={0}
              step={1}
              {...register('planned_posts', { valueAsNumber: true })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.planned_posts && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.planned_posts.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              Planned Videos
            </label>
            <input
              type="number"
              min={0}
              step={1}
              {...register('planned_videos', { valueAsNumber: true })}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.planned_videos && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.planned_videos.message}</p>
            )}
          </div>
        </div>

        {/* Warning if all three planned counts are 0 */}
        {allZeroTargets && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Progress will show N/A (Total planned is 0)</span>
          </div>
        )}
      </div>

      {/* Project Status */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Status
        </label>
        <select
          {...register('status')}
          className="w-full sm:w-64 px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
        >
          <option value="not_started" className="bg-white dark:bg-slate-800">Not Started</option>
          <option value="in_progress" className="bg-white dark:bg-slate-800">In Progress</option>
          <option value="on_hold" className="bg-white dark:bg-slate-800">On Hold</option>
          <option value="completed" className="bg-white dark:bg-slate-800">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.status.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/projects"
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:bg-indigo-400 flex items-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {isEditing ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};
