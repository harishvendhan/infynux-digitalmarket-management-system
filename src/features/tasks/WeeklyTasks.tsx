import React, { useState, useMemo } from 'react';
import type { Task, ProjectWeek } from '../../types';
import { TaskTable } from './TaskTable';
import { formatDate, isDateInRange, getTodayString } from '../../lib/dates';
import { Plus, Calendar, Film, FileText, Video } from 'lucide-react';

interface WeeklyTasksProps {
  weeks: ProjectWeek[];
  tasks: Task[];
  onAddTask: (defaultDate?: string, minDate?: string, maxDate?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export const WeeklyTasks: React.FC<WeeklyTasksProps> = ({
  weeks,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) => {
  const today = getTodayString();

  // Determine initial active week (containing today if inside range, else Week 1)
  const defaultWeekNumber = useMemo(() => {
    if (!weeks || weeks.length === 0) return 1;
    const currentWeek = weeks.find((w) => isDateInRange(today, w.start_date, w.end_date));
    return currentWeek ? currentWeek.week_number : weeks[0]?.week_number || 1;
  }, [weeks, today]);

  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(defaultWeekNumber);

  const activeWeek = weeks.find((w) => w.week_number === selectedWeekNumber) || weeks[0];

  // Tasks in current selected week
  const weekTasks = useMemo(() => {
    if (!activeWeek) return [];
    return tasks.filter((t) =>
      isDateInRange(t.task_date, activeWeek.start_date, activeWeek.end_date)
    );
  }, [tasks, activeWeek]);

  // Counters for the selected week per Section 5.5 & D1
  const completedReels = weekTasks.filter(
    (t) => t.status === 'completed' && t.content_type === 'reel'
  ).length;
  const completedPosts = weekTasks.filter(
    (t) => t.status === 'completed' && t.content_type === 'post'
  ).length;
  const completedVideos = weekTasks.filter(
    (t) => t.status === 'completed' && t.content_type === 'video'
  ).length;
  const inProgressCount = weekTasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Week Selector Chips Bar */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Select Schedule Week
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {weeks.map((week) => {
            const isSelected = week.week_number === selectedWeekNumber;
            const isCurrent = isDateInRange(today, week.start_date, week.end_date);

            return (
              <button
                key={week.id || week.week_number}
                type="button"
                onClick={() => setSelectedWeekNumber(week.week_number)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <span>Week {week.week_number}</span>
                <span className={isSelected ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}>
                  · {formatDate(week.start_date)} – {formatDate(week.end_date)}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" title="Current Week" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Header & Counters (Section 5.5) */}
      {activeWeek && (
        <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Week {activeWeek.week_number} ({formatDate(activeWeek.start_date)} – {formatDate(activeWeek.end_date)})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {weekTasks.length} total deliverable{weekTasks.length === 1 ? '' : 's'} · {inProgressCount} in progress
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddTask(activeWeek.start_date, activeWeek.start_date, activeWeek.end_date)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task to Week {activeWeek.week_number}
            </button>
          </div>

          {/* Three Counters per D1 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
                  Reels Completed
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{completedReels}</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
                  Posts Completed
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{completedPosts}</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">
                  Videos Completed
                </span>
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{completedVideos}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Week's Deliverable Tasks Table */}
      {weekTasks.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No tasks added yet for this week</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Plan and schedule deliverables for Week {activeWeek?.week_number}.</p>
          <button
            type="button"
            onClick={() => onAddTask(activeWeek?.start_date, activeWeek?.start_date, activeWeek?.end_date)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Task
          </button>
        </div>
      ) : (
        <TaskTable
          tasks={weekTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      )}
    </div>
  );
};
