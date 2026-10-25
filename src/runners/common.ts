import { useCallback, useEffect, useRef, useState } from 'react';

/** Keeps the screen on while a session is open (the phone sits on the floor). */
export function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    let alive = true;
    const request = async () => {
      try {
        const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        if (wl && document.visibilityState === 'visible') lock = await wl.request('screen');
        if (!alive) lock?.release();
      } catch {
        // Not supported or refused: the session still works, the screen may just dim.
      }
    };
    request();
    const onVis = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVis);
      lock?.release().catch(() => {});
    };
  }, []);
}

/** Wall-clock stopwatch that survives the tab sleeping. */
export function useStopwatch(initialMs = 0) {
  const [running, setRunning] = useState(false);
  const base = useRef(initialMs);
  const startedAt = useRef(0);
  const [, force] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((x) => x + 1), 250);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = running ? base.current + (Date.now() - startedAt.current) : base.current;

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setRunning(true);
  }, []);
  const pause = useCallback(() => {
    base.current += Date.now() - startedAt.current;
    setRunning(false);
  }, []);
  const reset = useCallback((ms = 0) => {
    base.current = ms;
    startedAt.current = Date.now();
    force((x) => x + 1);
  }, []);

  return { elapsed, running, start, pause, reset };
}

/** Countdown from `ms`; calls onEnd once when it reaches zero. */
export function useCountdown(onEnd?: () => void) {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [, force] = useState(0);
  const ended = useRef(onEnd);
  ended.current = onEnd;

  useEffect(() => {
    if (endsAt === null) return;
    const id = setInterval(() => {
      if (Date.now() >= endsAt) {
        setEndsAt(null);
        ended.current?.();
      } else force((x) => x + 1);
    }, 250);
    return () => clearInterval(id);
  }, [endsAt]);

  return {
    left: endsAt === null ? 0 : Math.max(0, endsAt - Date.now()),
    active: endsAt !== null,
    start: (ms: number) => setEndsAt(Date.now() + ms),
    stop: () => setEndsAt(null),
  };
}

let ctx: AudioContext | null = null;

/** Must be called from a tap once, so later beeps are allowed to play. */
export function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx ??= new AC();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

export function beep(times = 1, freq = 880) {
  if (!ctx) return;
  const now = ctx.currentTime;
  for (let i = 0; i < times; i++) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now + i * 0.28);
    g.gain.exponentialRampToValueAtTime(0.35, now + i * 0.28 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.28 + 0.22);
    o.connect(g).connect(ctx.destination);
    o.start(now + i * 0.28);
    o.stop(now + i * 0.28 + 0.24);
  }
}

export const clock = (ms: number) => {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};
