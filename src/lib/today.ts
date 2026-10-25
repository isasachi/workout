import { useEffect, useState } from 'react';
import { SCHEDULE, sessionInfo } from '../data/plan';
import { isoDay, parseDay, weekPos } from './dates';
import { useStore } from './store';

/** Current local day; refreshes when the app comes back after midnight. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const tick = () => setNow((prev) => (isoDay(prev) === isoDay(new Date()) ? prev : new Date()));
    const id = setInterval(tick, 60_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, []);
  return now;
}

export function useDay(dateIso: string) {
  const start = useStore((s) => s.startDate);
  const date = parseDay(dateIso);
  const pos = weekPos(start, date);
  const id = SCHEDULE[date.getDay()];
  return { date, iso: dateIso, pos, id, info: sessionInfo(id, pos.week), start };
}
