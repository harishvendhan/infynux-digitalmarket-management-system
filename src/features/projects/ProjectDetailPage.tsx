import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useParams, useNavigate } from 'react-router-dom';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { TaskFormModal } from '../tasks/TaskForm';
import { TaskTable } from '../tasks/TaskTable';
import { WeeklyTasks } from '../tasks/WeeklyTasks';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from '../projects/useProjects';
import {
  useProjectWeeks,
  useProjectTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '../tasks/useTasks';
import { formatDate, formatDuration } from '../../lib/dates';
import type { Task, ContentType, ProjectStatus } from '../../types';
import type { TaskFormData } from '../../lib/schemas';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Film,
  FileText,
  FileDown,
  Video,
  Layers,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Project & Task Queries
  const { data: projectItem, isLoading: isProjectLoading } = useProject(id);
  const project = projectItem?.project;

  const { data: weeks = [] } = useProjectWeeks(id, project?.start_date, project?.end_date);
  const { data: tasks = [] } = useProjectTasks(id);

  // Mutations
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const createTaskMutation = useCreateTask(id || '');
  const updateTaskMutation = useUpdateTask(id || '');
  const deleteTaskMutation = useDeleteTask(id || '');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultType, setModalDefaultType] = useState<ContentType>('reel');
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [modalMinDate, setModalMinDate] = useState<string | undefined>(undefined);
  const [modalMaxDate, setModalMaxDate] = useState<string | undefined>(undefined);

  // Delete Dialog States
  const [projectToDelete, setProjectToDelete] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Derive dynamic stats directly from task rows if live (D1, D4)
  const completedReels = useMemo(
    () => tasks.filter((t) => t.status === 'completed' && t.content_type === 'reel').length,
    [tasks]
  );
  const completedPosts = useMemo(
    () => tasks.filter((t) => t.status === 'completed' && t.content_type === 'post').length,
    [tasks]
  );
  const completedVideos = useMemo(
    () => tasks.filter((t) => t.status === 'completed' && t.content_type === 'video').length,
    [tasks]
  );

  const plannedReels = project?.planned_reels || 0;
  const plannedPosts = project?.planned_posts || 0;
  const plannedVideos = project?.planned_videos || 0;

  const totalPlanned = plannedReels + plannedPosts + plannedVideos;
  const totalCompleted = completedReels + completedPosts + completedVideos;
  const progressPercent = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : null;

  // Open Task Modal handler
  const handleOpenAddTask = (
    type?: ContentType,
    defaultDate?: string,
    minDate?: string,
    maxDate?: string
  ) => {
    setEditingTask(null);
    setModalDefaultType(type || 'reel');
    setModalDefaultDate(defaultDate || project?.start_date);
    setModalMinDate(minDate || project?.start_date);
    setModalMaxDate(maxDate || project?.end_date);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setModalDefaultType(task.content_type);
    setModalDefaultDate(task.task_date);
    setModalMinDate(project?.start_date);
    setModalMaxDate(project?.end_date);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ taskId: editingTask.id, formData: data });
    } else {
      await createTaskMutation.mutateAsync(data);
    }
    setIsTaskModalOpen(false);
  };

  const handleInlineStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !id) return;
    await updateProjectMutation.mutateAsync({
      id,
      formData: {
        title: project.title,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        planned_reels: project.planned_reels,
        planned_posts: project.planned_posts,
        planned_videos: project.planned_videos,
        status: newStatus,
      },
    });
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    await deleteProjectMutation.mutateAsync(id);
    navigate('/projects');
  };

  const handleDeleteTaskConfirm = async () => {
    if (!taskToDelete) return;
    await deleteTaskMutation.mutateAsync(taskToDelete.id);
    setTaskToDelete(null);
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Project Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          This project may have been removed or you do not have permission to view it.
        </p>
        <Link
          to="/projects"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const durationLabel = formatDuration(project.start_date, project.end_date);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers, count: null },
    { id: 'reels', label: 'Reels', icon: Film, count: completedReels, planned: plannedReels },
    { id: 'posts', label: 'Posts', icon: FileText, count: completedPosts, planned: plannedPosts },
    { id: 'videos', label: 'Videos', icon: Video, count: completedVideos, planned: plannedVideos },
    { id: 'weekly', label: 'Weekly Tasks', icon: Calendar, count: tasks.length },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to projects
      </Link>

      {/* Project Header (Section 5.4) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.title}</h1>

              {/* Changeable inline status (D8) */}
              <div className="relative inline-block">
                <select
                  value={project.status}
                  onChange={(e) => handleInlineStatusChange(e.target.value as ProjectStatus)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {project.description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">{project.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/media?project=${project.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5" />
              Proofs & PDF Report
            </Link>
            <Link
              to={`/projects/${project.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setProjectToDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span>
              {formatDate(project.start_date)} – {formatDate(project.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">{durationLabel}</span>
          </div>
        </div>

        {/* 100% Reached Non-Blocking Prompt (D8) */}
        {progressPercent !== null && progressPercent >= 100 && project.status !== 'completed' && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>100% of planned targets reached!</strong> Would you like to mark this campaign as Completed?
              </span>
            </div>
            <button
              onClick={() => handleInlineStatusChange('completed')}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg cursor-pointer"
            >
              Mark Completed
            </button>
          </div>
        )}

        {/* Needs Attention Alert (D6) */}
        {projectItem?.needsAttention.flag && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Needs Attention:</strong> {projectItem.needsAttention.reason}
            </span>
          </div>
        )}

        {/* Planned / Completed / Remaining Table per Section 5.4 */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Target vs Progress Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                  <th className="pb-2">Content Type</th>
                  <th className="pb-2 text-right">Planned</th>
                  <th className="pb-2 text-right">Completed</th>
                  <th className="pb-2 text-right">Remaining</th>
                  <th className="pb-2 pl-6 w-1/3">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-2.5 font-medium flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Reels
                  </td>
                  <td className="py-2.5 text-right font-medium">{plannedReels}</td>
                  <td className="py-2.5 text-right font-bold text-purple-700 dark:text-purple-400">{completedReels}</td>
                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {Math.max(plannedReels - completedReels, 0)}
                  </td>
                  <td className="py-2.5 pl-6">
                    <ProgressBar
                      progressPct={plannedReels > 0 ? (completedReels / plannedReels) * 100 : null}
                      totalPlanned={plannedReels}
                      totalCompleted={completedReels}
                      size="sm"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Posts
                  </td>
                  <td className="py-2.5 text-right font-medium">{plannedPosts}</td>
                  <td className="py-2.5 text-right font-bold text-blue-700 dark:text-blue-400">{completedPosts}</td>
                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {Math.max(plannedPosts - completedPosts, 0)}
                  </td>
                  <td className="py-2.5 pl-6">
                    <ProgressBar
                      progressPct={plannedPosts > 0 ? (completedPosts / plannedPosts) * 100 : null}
                      totalPlanned={plannedPosts}
                      totalCompleted={completedPosts}
                      size="sm"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Videos
                  </td>
                  <td className="py-2.5 text-right font-medium">{plannedVideos}</td>
                  <td className="py-2.5 text-right font-bold text-amber-700 dark:text-amber-400">{completedVideos}</td>
                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {Math.max(plannedVideos - completedVideos, 0)}
                  </td>
                  <td className="py-2.5 pl-6">
                    <ProgressBar
                      progressPct={plannedVideos > 0 ? (completedVideos / plannedVideos) * 100 : null}
                      totalPlanned={plannedVideos}
                      totalCompleted={completedVideos}
                      size="sm"
                    />
                  </td>
                </tr>
                <tr className="font-bold bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100">
                  <td className="py-2.5 px-1">Total</td>
                  <td className="py-2.5 text-right">{totalPlanned}</td>
                  <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">{totalCompleted}</td>
                  <td className="py-2.5 text-right text-slate-500 dark:text-slate-400">
                    {Math.max(totalPlanned - totalCompleted, 0)}
                  </td>
                  <td className="py-2.5 pl-6">
                    <ProgressBar
                      progressPct={progressPercent}
                      totalPlanned={totalPlanned}
                      totalCompleted={totalCompleted}
                      size="sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Synchronized Tabs Bar (Section 5.4: ?tab=overview|reels|posts|videos|weekly) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-t-lg'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.planned !== undefined ? `${tab.count}/${tab.planned}` : tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Project Overview</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select content tabs above or switch to Weekly Tasks to manage deliverables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddTask()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Deliverable Task
              </button>
            </div>

            {/* Recent Deliverables Stream */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                All Deliverables ({tasks.length})
              </h3>
              <TaskTable
                tasks={tasks}
                onEdit={handleOpenEditTask}
                onDelete={(t) => setTaskToDelete(t)}
                showContentTypeColumn={true}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Reels */}
        {activeTab === 'reels' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Film className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Reels ({completedReels} completed of {plannedReels} planned)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Short-form promotional reels published on Instagram and Facebook.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddTask('reel')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Reel
              </button>
            </div>

            <TaskTable
              tasks={tasks.filter((t) => t.content_type === 'reel')}
              onEdit={handleOpenEditTask}
              onDelete={(t) => setTaskToDelete(t)}
              filterContentType="reel"
              showContentTypeColumn={false}
            />
          </div>
        )}

        {/* Tab 3: Posts */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Posts ({completedPosts} completed of {plannedPosts} planned)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Static creatives, carousel designs, and offer announcements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddTask('post')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Post
              </button>
            </div>

            <TaskTable
              tasks={tasks.filter((t) => t.content_type === 'post')}
              onEdit={handleOpenEditTask}
              onDelete={(t) => setTaskToDelete(t)}
              filterContentType="post"
              showContentTypeColumn={false}
            />
          </div>
        )}

        {/* Tab 4: Videos */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Video className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Videos ({completedVideos} completed of {plannedVideos} planned)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Long-form walkthroughs, YouTube tours, and high-production content.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAddTask('video')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Video
              </button>
            </div>

            <TaskTable
              tasks={tasks.filter((t) => t.content_type === 'video')}
              onEdit={handleOpenEditTask}
              onDelete={(t) => setTaskToDelete(t)}
              filterContentType="video"
              showContentTypeColumn={false}
            />
          </div>
        )}

        {/* Tab 5: Weekly Tasks */}
        {activeTab === 'weekly' && (
          <WeeklyTasks
            weeks={weeks}
            tasks={tasks}
            onAddTask={(date, min, max) => handleOpenAddTask(undefined, date, min, max)}
            onEditTask={handleOpenEditTask}
            onDeleteTask={(t) => setTaskToDelete(t)}
          />
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        defaultContentType={modalDefaultType}
        defaultDate={modalDefaultDate}
        minDate={modalMinDate}
        maxDate={modalMaxDate}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {/* Delete Task Confirm Dialog (D11) */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTaskConfirm}
        title="Delete Deliverable Task"
        description={
          <p>
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{taskToDelete?.title}"</span>? All progress counts will recalculate automatically.
          </p>
        }
        confirmText="Delete Task"
        variant="danger"
        isLoading={deleteTaskMutation.isPending}
      />

      {/* Project Cascading Delete Confirm Dialog (D11) */}
      <ConfirmDialog
        isOpen={projectToDelete}
        onClose={() => setProjectToDelete(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project and All Tasks"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</span>?
            </p>
            <p className="text-rose-600 dark:text-rose-400 font-medium">
              This will permanently delete all {weeks.length} weeks and {tasks.length} deliverables.
            </p>
          </div>
        }
        confirmText="Delete Project"
        variant="danger"
        requireMatchText={project.title}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
};
