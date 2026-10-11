import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../../lib/schemas';
import type { Task, ContentType } from '../../types';
import { X, Globe, CheckCircle2 } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Task | null;
  defaultContentType?: ContentType;
  defaultDate?: string;
  minDate?: string;
  maxDate?: string;
  isSubmitting?: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultContentType = 'reel',
  defaultDate,
  minDate,
  maxDate,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      content_type: defaultContentType,
      task_date: defaultDate || new Date().toISOString().slice(0, 10),
      content_url: '',
      status: 'planned',
      notes: '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          content_type: initialData.content_type,
          task_date: initialData.task_date,
          content_url: initialData.content_url || '',
          status: initialData.status,
          notes: initialData.notes || '',
        });
      } else {
        reset({
          title: '',
          content_type: defaultContentType,
          task_date: defaultDate || minDate || new Date().toISOString().slice(0, 10),
          content_url: '',
          status: 'planned',
          notes: '',
        });
      }
    }
  }, [isOpen, initialData, defaultContentType, defaultDate, minDate, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialData ? 'Edit Deliverable Task' : 'Add New Deliverable'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter content details, publication link, and workflow status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Hotel promotional content"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.title.message}</p>
            )}
          </div>

          {/* Content Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Content Type *
              </label>
              <select
                {...register('content_type')}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="reel" className="bg-white dark:bg-slate-800">Reel</option>
                <option value="post" className="bg-white dark:bg-slate-800">Post</option>
                <option value="video" className="bg-white dark:bg-slate-800">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="planned" className="bg-white dark:bg-slate-800">Planned</option>
                <option value="in_progress" className="bg-white dark:bg-slate-800">In Progress</option>
                <option value="completed" className="bg-white dark:bg-slate-800">Completed</option>
              </select>
            </div>
          </div>

          {/* Task Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Date *
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDate}
                max={maxDate}
                {...register('task_date')}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            {errors.task_date && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.task_date.message}</p>
            )}
          </div>

          {/* Published Link (D10: required if completed) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Published Content Link {selectedStatus === 'completed' && <span className="text-rose-500">*</span>}
              </label>
              {selectedStatus === 'completed' && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Required for Completed
                </span>
              )}
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="url"
                {...register('content_url')}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            {errors.content_url && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errors.content_url.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="Caption copy, hashtags, or feedback notes..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:bg-indigo-400 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {initialData ? 'Update Deliverable' : 'Add Deliverable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
