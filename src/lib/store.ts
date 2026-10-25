import { get, set } from 'idb-keyval';
import { useSyncExternalStore } from 'react';
import type { SessionId } from '../data/plan';

export type SetLog = { level: number; values: (number | null)[] };

export type SessionLog = {
  date: string;
  session: SessionId;
  cycle: number;
  week: number;
  done: boolean;
  sets?: Record<string, SetLog>;
  minutes?: number;
  option?: string;
  updatedAt: number;
};

export type State = {
  loaded: boolean;
  startDate: string | null;
  levels: Record<string, number>;
  logs: Record<string, SessionLog>;
};

const KEY = 'entreno-v1';
let state: State = { loaded: false, startDate: null, levels: {}, logs: {} };
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveError = false;

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const { loaded: _loaded, ...data } = state;
    try {
      await set(KEY, data);
      saveError = false;
    } catch {
      saveError = true;
      emit();
    }
  }, 250);
}

export function update(fn: (s: State) => State) {
  state = fn(state);
  emit();
  persist();
}

export async function boot() {
  try {
    const data = (await get(KEY)) as Omit<State, 'loaded'> | undefined;
    state = { loaded: true, startDate: data?.startDate ?? null, levels: data?.levels ?? {}, logs: data?.logs ?? {} };
  } catch {
    state = { ...state, loaded: true };
  }
  emit();
  // Ask iOS and other browsers not to evict the data under storage pressure.
  navigator.storage?.persist?.().catch(() => {});
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
  );
}

export const useSaveError = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => saveError);

// ---------- Actions ----------

export const setStartDate = (d: string) => update((s) => ({ ...s, startDate: d }));

export const setLevel = (exercise: string, level: number) => update((s) => ({ ...s, levels: { ...s.levels, [exercise]: level } }));

export function saveLog(log: Omit<SessionLog, 'updatedAt'>) {
  update((s) => ({ ...s, logs: { ...s.logs, [log.date]: { ...log, updatedAt: Date.now() } } }));
}

export function removeLog(date: string) {
  update((s) => {
    const logs = { ...s.logs };
    delete logs[date];
    return { ...s, logs };
  });
}

export function exportData(): string {
  const { loaded: _loaded, ...data } = state;
  return JSON.stringify({ app: 'entreno', version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
}

export function importData(text: string): { ok: true; sessions: number } | { ok: false; reason: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'El archivo no es una copia válida de Entreno.' };
  }
  const p = parsed as Partial<State> & { app?: string };
  if (p.app !== 'entreno' || typeof p.logs !== 'object' || p.logs === null) {
    return { ok: false, reason: 'El archivo no es una copia de Entreno.' };
  }
  update(() => ({ loaded: true, startDate: p.startDate ?? null, levels: p.levels ?? {}, logs: p.logs as Record<string, SessionLog> }));
  return { ok: true, sessions: Object.keys(p.logs).length };
}

export function resetAll() {
  update(() => ({ loaded: true, startDate: null, levels: {}, logs: {} }));
}
