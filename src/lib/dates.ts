import {
  parseISO,
  format,
  differenceInCalendarDays,
  addDays,
  isAfter,
  isBefore,
  isEqual,
} from 'date-fns';

/**
 * Formats a date string (YYYY-MM-DD) or Date object as DD MMM YYYY (en-IN format).
 * e.g., 2026-10-09 -> "09 Oct 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) return '-';
    return format(d, 'dd MMM yyyy');
  } catch {
    return '-';
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates inclusive duration between start and end date (D7).
 * Output: "M months (N days, W weeks)" or "N days (W weeks)"
 * Example: 92 days -> "3 months (92 days, 14 weeks)"
 */
export function formatDuration(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return '-';
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (isAfter(start, end)) return 'Invalid range';

    const inclusiveDays = differenceInCalendarDays(end, start) + 1;
    if (inclusiveDays <= 0) return '0 days';

    const weeks = Math.ceil(inclusiveDays / 7);
    const weekLabel = weeks === 1 ? '1 week' : `${weeks} weeks`;
    const dayLabel = inclusiveDays === 1 ? '1 day' : `${inclusiveDays} days`;

    if (inclusiveDays >= 28) {
      const rawMonths = inclusiveDays / 30.4375;
      const roundedMonths = Math.round(rawMonths * 10) / 10;
      const months =
        Math.abs(roundedMonths - Math.round(roundedMonths)) < 0.2
          ? Math.round(roundedMonths)
          : roundedMonths;
      const monthLabel = months === 1 ? '1 month' : `${months} months`;

      return `${monthLabel} (${dayLabel}, ${weekLabel})`;
    }

    return `${dayLabel} (${weekLabel})`;
  } catch {
    return '-';
  }
}

/**
 * Generates project-relative weeks per D2:
 * Week 1 starts on start_date and covers 7 days.
 * Later weeks continue in 7-day blocks.
 * The last week ends on end_date and may be shorter.
 */
export interface GeneratedWeek {
  week_number: number;
  start_date: string;
  end_date: string;
}

export function generateProjectWeeks(startDate: string, endDate: string): GeneratedWeek[] {
  if (!startDate || !endDate) return [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (isAfter(start, end)) return [];

  const weeks: GeneratedWeek[] = [];
  let currentStart = start;
  let weekNum = 1;

  while (!isAfter(currentStart, end)) {
    // 7-day block ends at currentStart + 6 days
    let currentEnd = addDays(currentStart, 6);
    if (isAfter(currentEnd, end)) {
      currentEnd = end;
    }

    weeks.push({
      week_number: weekNum,
      start_date: format(currentStart, 'yyyy-MM-dd'),
      end_date: format(currentEnd, 'yyyy-MM-dd'),
    });

    currentStart = addDays(currentEnd, 1);
    weekNum++;
  }

  return weeks;
}

/**
 * Checks if a date falls inclusively between start and end date.
 */
export function isDateInRange(targetDate: string, startDate: string, endDate: string): boolean {
  try {
    const target = parseISO(targetDate);
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return (
      (isAfter(target, start) || isEqual(target, start)) &&
      (isBefore(target, end) || isEqual(target, end))
    );
  } catch {
    return false;
  }
}
