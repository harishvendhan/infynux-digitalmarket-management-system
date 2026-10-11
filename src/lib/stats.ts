import { parseISO, differenceInCalendarDays } from 'date-fns';
import type { Task, ContentType, Project, ProjectStatsView, NeedsAttentionResult } from '../types';
import { generateProjectWeeks } from './dates';

/**
 * Counts tasks with status 'completed', optionally filtered by content type.
 */
export function completedCount(tasks: Task[], type?: ContentType): number {
  return tasks.filter(
    (t) => t.status === 'completed' && (!type || t.content_type === type)
  ).length;
}

/**
 * Calculates remaining count: max(planned - completed, 0) (D5).
 */
export function remaining(planned: number, completed: number): number {
  return Math.max(planned - completed, 0);
}

/**
 * Calculates progress percentage rounded to 1 decimal (D5).
 * Returns null when planned is 0.
 */
export function progressPct(completed: number, planned: number): number | null {
  if (planned <= 0) return null;
  const pct = (completed / planned) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Alias for generateProjectWeeks for D2 specification.
 */
export const weeksBetween = generateProjectWeeks;

/**
 * Evaluates Needs Attention rule per D6:
 * A project is flagged when its status is not Completed and either:
 * (a) the end date is within 14 days and progress is under 70%, or
 * (b) the end date has passed.
 * Shows reason: "Ends in X days · Y% done" or "Overdue by X days"
 */
export function needsAttention(
  project: Pick<Project, 'end_date' | 'status'>,
  stats: Pick<ProjectStatsView, 'progress_pct'> | { progress_pct: number | null },
  todayStr: string
): NeedsAttentionResult {
  if (project.status === 'completed') {
    return { flag: false, reason: null };
  }

  const today = parseISO(todayStr);
  const end = parseISO(project.end_date);
  const diffDays = differenceInCalendarDays(end, today); // positive if in future, negative if past
  const pct = stats.progress_pct ?? 0;

  // Case (b): end date has passed (diffDays < 0)
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    const dayLabel = overdueDays === 1 ? '1 day' : `${overdueDays} days`;
    return {
      flag: true,
      reason: `Overdue by ${dayLabel}`,
    };
  }

  // Case (a): end date is within 14 days (0 <= diffDays <= 14) and progress is under 70%
  if (diffDays <= 14 && pct < 70) {
    const dayLabel = diffDays === 1 ? '1 day' : `${diffDays} days`;
    const formattedPct = stats.progress_pct !== null ? `${stats.progress_pct}%` : '0%';
    return {
      flag: true,
      reason: `Ends in ${dayLabel} · ${formattedPct} done`,
    };
  }

  return { flag: false, reason: null };
}

/**
 * Calculates aggregated statistics from an array of tasks and target counts.
 */
export function calculateStatsFromTasks(
  tasks: Task[],
  plannedReels: number,
  plannedPosts: number,
  plannedVideos: number
): ProjectStatsView {
  const completed_reels = completedCount(tasks, 'reel');
  const completed_posts = completedCount(tasks, 'post');
  const completed_videos = completedCount(tasks, 'video');

  const total_planned = plannedReels + plannedPosts + plannedVideos;
  const total_completed = completed_reels + completed_posts + completed_videos;
  const total_remaining = remaining(total_planned, total_completed);
  const progress_pct = progressPct(total_completed, total_planned);

  const in_progress_tasks = tasks.filter((t) => t.status === 'in_progress').length;
  const planned_tasks = tasks.filter((t) => t.status === 'planned').length;

  return {
    project_id: tasks[0]?.project_id || '',
    completed_reels,
    planned_reels: plannedReels,
    completed_posts,
    planned_posts: plannedPosts,
    completed_videos,
    planned_videos: plannedVideos,
    total_planned,
    total_completed,
    total_remaining,
    progress_pct,
    in_progress_tasks,
    planned_tasks,
  };
}
