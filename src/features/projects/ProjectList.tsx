import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  X,
  ArrowUpDown,
  Edit3,
  Trash2,
  Layers,
} from 'lucide-react';
import type { ProjectWithStats } from '../../types';
import { ProjectCard } from './ProjectCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate, formatDuration } from '../../lib/dates';
import { useDeleteProject } from './useProjects';

interface ProjectListProps {
  items: ProjectWithStats[];
  isLoading?: boolean;
}

type SortField = 'created_at' | 'start_date' | 'end_date' | 'title';
type SortDirection = 'asc' | 'desc';

export const ProjectList: React.FC<ProjectListProps> = ({ items, isLoading }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const deleteMutation = useDeleteProject();

  // Filtered and sorted projects
  const filteredItems = useMemo(() => {
    return items
      .filter(({ project }) => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a.project[sortField] || '';
        let valB = b.project[sortField] || '';

        if (sortField === 'title') {
          return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDir === 'asc'
          ? new Date(valA).getTime() - new Date(valB).getTime()
          : new Date(valB).getTime() - new Date(valA).getTime();
      });
  }, [items, searchQuery, statusFilter, sortField, sortDir]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  if (items.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No projects yet"
        description="Create your first client marketing campaign to begin generating weekly schedules and tracking content."
        actionText="Create New Project"
        onAction={() => {
          window.location.href = '/projects/new';
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search, Filter, Sort and View Mode Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title..."
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter, Sort & View Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">All Statuses</option>
            <option value="not_started" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Not Started</option>
            <option value="in_progress" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">In Progress</option>
            <option value="on_hold" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">On Hold</option>
            <option value="completed" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Completed</option>
          </select>

          {/* Sort Field */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="created_at" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Created Date</option>
            <option value="start_date" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Start Date</option>
            <option value="end_date" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">End Date</option>
            <option value="title" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">Project Title</option>
          </select>

          {/* Sort Direction Toggle */}
          <button
            type="button"
            onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Sort ${sortDir === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* No Matches Found */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching projects</h3>
          <p className="text-xs text-slate-500">
            No projects matched your search or status filter.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ProjectCard
              key={item.project.id}
              item={item}
              onDelete={(id, title) => setDeleteTarget({ id, title })}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4 text-center">Reels</th>
                  <th className="py-3 px-4 text-center">Posts</th>
                  <th className="py-3 px-4 text-center">Videos</th>
                  <th className="py-3 px-4 w-44">Overall Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(({ project, stats }) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm block line-clamp-1"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      <div>
                        {formatDate(project.start_date)} – {formatDate(project.end_date)}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {formatDuration(project.start_date, project.end_date)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {stats.completed_reels} / {stats.planned_reels}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {stats.completed_posts} / {stats.planned_posts}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {stats.completed_videos} / {stats.planned_videos}
                    </td>
                    <td className="py-3 px-4">
                      <ProgressBar
                        progressPct={stats.progress_pct}
                        totalPlanned={stats.total_planned}
                        totalCompleted={stats.total_completed}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link
                        to={`/projects/${project.id}`}
                        className="px-2.5 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg inline-block"
                      >
                        Open
                      </Link>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg inline-block"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: project.id, title: project.title })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cascading Deletion Dialog per D11 */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project and Cascading Data"
        description={
          <div className="space-y-2">
            <p>
              Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.title}</span>?
            </p>
            <p className="text-rose-600 font-medium">
              This action will permanently delete all associated weekly schedules, task deliverables, and published content links.
            </p>
          </div>
        }
        confirmText="Delete Project"
        variant="danger"
        requireMatchText={deleteTarget?.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
