import { describe, it, expect } from 'vitest';
import {
  completedCount,
  remaining,
  progressPct,
  weeksBetween,
  needsAttention,
} from './stats';
import type { Task } from '../types';

describe('Stats calculation tests (Section 6)', () => {
  it('calculates remaining and progressPct correctly for 20/15/10 planned and 12/10/6 completed', () => {
    const plannedReels = 20;
    const plannedPosts = 15;
    const plannedVideos = 10;

    const completedReels = 12;
    const completedPosts = 10;
    const completedVideos = 6;

    expect(remaining(plannedReels, completedReels)).toBe(8);
    expect(remaining(plannedPosts, completedPosts)).toBe(5);
    expect(remaining(plannedVideos, completedVideos)).toBe(4);

    const totalPlanned = plannedReels + plannedPosts + plannedVideos; // 45
    const totalCompleted = completedReels + completedPosts + completedVideos; // 28
    expect(totalPlanned).toBe(45);
    expect(totalCompleted).toBe(28);

    const pct = progressPct(totalCompleted, totalPlanned);
    // 28 / 45 * 100 = 62.222... -> 62.2%
    expect(pct).toBe(62.2);
  });

  it('handles 0 planned items with null progress without dividing by zero', () => {
    expect(progressPct(0, 0)).toBeNull();
  });

  it('handles completed exceeding planned without capping the raw percentage', () => {
    const pct = progressPct(15, 10);
    expect(pct).toBe(150);
    expect(remaining(10, 15)).toBe(0);
  });

  it('counts only completed tasks (D1)', () => {
    const tasks: Partial<Task>[] = [
      { content_type: 'reel', status: 'completed' },
      { content_type: 'reel', status: 'in_progress' },
      { content_type: 'reel', status: 'planned' },
      { content_type: 'post', status: 'completed' },
      { content_type: 'video', status: 'completed' },
    ];

    expect(completedCount(tasks as Task[], 'reel')).toBe(1);
    expect(completedCount(tasks as Task[], 'post')).toBe(1);
    expect(completedCount(tasks as Task[], 'video')).toBe(1);
    expect(completedCount(tasks as Task[])).toBe(3);
  });
});

describe('Week generation tests (D2 and Section 6)', () => {
  it('generates 14 weeks from Oct 1 to Dec 31, with Week 1 Oct 1-7 and final end date Dec 31', () => {
    const weeks = weeksBetween('2026-10-01', '2026-12-31');
    expect(weeks.length).toBe(14);
    expect(weeks[0]).toEqual({
      week_number: 1,
      start_date: '2026-10-01',
      end_date: '2026-10-07',
    });
    // Final week ends Dec 31 and is shorter
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek.week_number).toBe(14);
    expect(lastWeek.end_date).toBe('2026-12-31');
  });

  it('a one-day project gives 1 week of 1 day', () => {
    const weeks = weeksBetween('2026-10-01', '2026-10-01');
    expect(weeks.length).toBe(1);
    expect(weeks[0]).toEqual({
      week_number: 1,
      start_date: '2026-10-01',
      end_date: '2026-10-01',
    });
  });

  it('a project of exactly 7 days gives 1 week', () => {
    const weeks = weeksBetween('2026-10-01', '2026-10-07');
    expect(weeks.length).toBe(1);
    expect(weeks[0]).toEqual({
      week_number: 1,
      start_date: '2026-10-01',
      end_date: '2026-10-07',
    });
  });
});

describe('Needs Attention rule tests (D6)', () => {
  it('flags project when end date is within 14 days and progress is under 70%', () => {
    const project = { end_date: '2026-10-15', status: 'in_progress' as const };
    const stats = { progress_pct: 41 };
    const today = '2026-10-09'; // 6 days remaining

    const result = needsAttention(project, stats, today);
    expect(result.flag).toBe(true);
    expect(result.reason).toBe('Ends in 6 days · 41% done');
  });

  it('flags project when overdue', () => {
    const project = { end_date: '2026-10-06', status: 'in_progress' as const };
    const stats = { progress_pct: 50 };
    const today = '2026-10-09'; // 3 days overdue

    const result = needsAttention(project, stats, today);
    expect(result.flag).toBe(true);
    expect(result.reason).toBe('Overdue by 3 days');
  });

  it('does not flag project if status is completed', () => {
    const project = { end_date: '2026-10-06', status: 'completed' as const };
    const stats = { progress_pct: 100 };
    const today = '2026-10-09';

    const result = needsAttention(project, stats, today);
    expect(result.flag).toBe(false);
  });
});
