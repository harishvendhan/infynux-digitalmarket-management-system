import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { useDailyTasks, type TaskCategory } from './useDailyTasks';

const CATEGORY_STYLES: Record<TaskCategory, { label: string; bg: string; text: string }> = {
  general: { label: 'General', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  reel: { label: 'Reel', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300' },
  post: { label: 'Post', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
  video: { label: 'Video', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
  client: { label: 'Client', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
};

interface DailyTaskCardProps {
  className?: string;
}

export const DailyTaskCard: React.FC<DailyTaskCardProps> = ({
  className = '',
}) => {
  const {
    tasks,
    allTasks,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
    filter,
    setFilter,
    stats,
  } = useDailyTasks();

  const [inputTitle, setInputTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('general');

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputTitle.trim()) return;
    addTask(inputTitle, selectedCategory);
    setInputTitle('');
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-colors ${className}`}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/60 to-white dark:from-slate-900/60 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Daily Task Checklist
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {todayFormatted}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Check off deliverables as they are completed
            </p>
          </div>
        </div>

        {/* Progress Badge */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              {stats.completedCount} of {stats.totalCount} completed
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {stats.progressPct}% done today
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-500 ease-out"
                strokeDasharray={`${stats.progressPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {stats.progressPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${stats.progressPct}%` }}
        />
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Add a new daily task... (e.g., Publish Instagram Reel, Review analytics)"
              className="w-full pl-3.5 pr-24 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TaskCategory)}
              aria-label="Task category"
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2 rounded-lg border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="general">General</option>
              <option value="reel">Reel</option>
              <option value="post">Post</option>
              <option value="video">Video</option>
              <option value="client">Client</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!inputTitle.trim()}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Filter Pills & Clear Action */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              All ({allTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              Completed ({stats.completedCount})
            </button>
          </div>

          {stats.completedCount > 0 && (
            <button
              type="button"
              onClick={clearCompleted}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition-colors font-medium cursor-pointer"
            >
              Clear completed
            </button>
          )}
        </div>
      </form>

      {/* Task Checklist Items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto max-h-[420px]">
        {tasks.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'pending'
                ? 'All tasks completed!'
                : 'No daily tasks scheduled'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1">
              {filter === 'pending'
                ? 'Great job! You have cleared all pending daily tasks.'
                : 'Type a task above to add it to your daily checklist.'}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const catStyle = CATEGORY_STYLES[task.category] || CATEGORY_STYLES.general;

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                  task.completed ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-start gap-3 min-w-0 flex-1 mr-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                  >
                    {task.completed ? (
                      <div className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                        <CheckSquare className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800 transition-colors" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      onClick={() => toggleTask(task.id)}
                      className={`text-sm cursor-pointer select-none transition-all ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-600 font-normal'
                          : 'text-slate-800 dark:text-slate-200 font-medium hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${catStyle.bg} ${catStyle.text}`}
                      >
                        {catStyle.label}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {task.completed ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                  aria-label="Delete task"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          Click any task or checkbox to toggle status
        </span>
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {stats.pendingCount} remaining
        </span>
      </div>
    </div>
  );
};
