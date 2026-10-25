import { EXERCISES } from '../data/exercises';
import { STRENGTH, type Slot } from '../data/plan';
import type { SessionLog, State } from './store';

export function levelOf(s: State, exercise: string): number {
  const saved = s.levels[exercise];
  if (saved !== undefined) return saved;
  const slot = [...STRENGTH.A, ...STRENGTH.B].find((x) => x.exercise === exercise);
  return slot?.defaultLevel ?? 0;
}

export type Entry = { date: string; level: number; values: (number | null)[] };

/** Every logged set list for an exercise, newest first. */
export function historyOf(logs: Record<string, SessionLog>, exercise: string): Entry[] {
  return Object.values(logs)
    .filter((l) => l.sets?.[exercise] && l.sets[exercise].values.some((v) => v !== null))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((l) => ({ date: l.date, level: l.sets![exercise].level, values: l.sets![exercise].values }));
}

/**
 * The plan's rule: when every set reaches the top of the range at the
 * current variant, move to the next variant and restart at the bottom.
 */
export function readyToLevelUp(entries: Entry[], slot: Slot, level: number, setsPlanned: number): boolean {
  const ex = EXERCISES[slot.exercise];
  if (!ex || level >= ex.ladder.length - 1) return false;
  const last = entries.find((e) => e.level === level);
  if (!last) return false;
  const done = last.values.filter((v): v is number => v !== null);
  return done.length >= setsPlanned && done.every((v) => v >= slot.reps[1]);
}

export const formatValues = (values: (number | null)[], metric: 'reps' | 'secs') =>
  values
    .filter((v): v is number => v !== null)
    .map((v) => (metric === 'secs' ? `${v} s` : String(v)))
    .join(' · ');
