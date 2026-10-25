const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD (never UTC, so late-night sessions stay on the right day). */
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseDay = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

const DAY_MS = 86_400_000;

/** Week 1 starts on the start date if it is a Monday, otherwise on the following Monday. */
const anchorOf = (start: Date) => (start.getDay() === 1 ? start : addDays(mondayOf(start), 7));

export type WeekPos = { absolute: number; cycle: number; week: number; started: boolean };

/** Week of the 8-week cycle that contains `day`. Days between a mid-week start and the first Monday count as week 1. */
export function weekPos(start: string | null, day: Date): WeekPos {
  if (!start) return { absolute: 1, cycle: 1, week: 1, started: false };
  const s = parseDay(start);
  if (day < s) return { absolute: 1, cycle: 1, week: 1, started: false };
  const days = Math.round((mondayOf(day).getTime() - anchorOf(s).getTime()) / DAY_MS);
  const weeks = Math.max(0, Math.floor(days / 7));
  return { absolute: weeks + 1, cycle: Math.floor(weeks / 8) + 1, week: (weeks % 8) + 1, started: true };
}

/** Dates (Mon→Sun) of the given cycle week. */
export function datesOfWeek(start: string, cycle: number, week: number): Date[] {
  const m = addDays(anchorOf(parseDay(start)), ((cycle - 1) * 8 + (week - 1)) * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(m, i));
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
export const shortDate = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

export function nextMonday(from: Date) {
  const m = mondayOf(from);
  return isoDay(addDays(m, 7));
}
