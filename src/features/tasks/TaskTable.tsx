import React, { useState } from 'react';
import type { Task, ContentType } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ContentTypeBadge } from '../../components/ui/ContentTypeBadge';
import { LinkCell } from '../../components/ui/LinkCell';
import { formatDate } from '../../lib/dates';
import { Edit3, Trash2, Search, Filter } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  filterContentType?: ContentType;
  showContentTypeColumn?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onEdit,
  onDelete,
  filterContentType,
  showContentTypeColumn = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesType = !filterContentType || t.content_type === filterContentType;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      formatDate(t.task_date).toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-3">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deliverables by title or date..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800">All Statuses</option>
            <option value="planned" className="bg-white dark:bg-slate-800">Planned</option>
            <option value="in_progress" className="bg-white dark:bg-slate-800">In Progress</option>
            <option value="completed" className="bg-white dark:bg-slate-800">Completed</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
          No deliverables matching current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Title</th>
                {showContentTypeColumn && <th className="py-2.5 px-3">Type</th>}
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Published Link</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div>{task.title}</div>
                    {task.notes && (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1">
                        {task.notes}
                      </div>
                    )}
                  </td>
                  {showContentTypeColumn && (
                    <td className="py-2.5 px-3">
                      <ContentTypeBadge type={task.content_type} />
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(task.task_date)}
                  </td>
                  <td className="py-2.5 px-3">
                    <LinkCell url={task.content_url} />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit task"
                      aria-label="Edit task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
