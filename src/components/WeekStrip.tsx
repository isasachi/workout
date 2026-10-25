import { DAY_SHORT, KIND_COLOR, SCHEDULE, sessionInfo } from '../data/plan';
import { addDays, datesOfWeek, isoDay, mondayOf, shortDate } from '../lib/dates';
import { useStore } from '../lib/store';
import { useNav } from '../nav';
import { Icon } from './Icon';
import s from './WeekStrip.module.css';

/** The current week at a glance: one capsule per day, coloured by session, checked when done. */
export function WeekStrip({ now, cycle, week, started }: { now: Date; cycle: number; week: number; started: boolean }) {
  const nav = useNav();
  const start = useStore((st) => st.startDate);
  const logs = useStore((st) => st.logs);
  const days = start && started ? datesOfWeek(start, cycle, week) : Array.from({ length: 7 }, (_, i) => addDays(mondayOf(now), i));
  const today = isoDay(now);

  return (
    <ol className={s.strip} aria-label="Esta semana">
      {days.map((d) => {
        const iso = isoDay(d);
        const kind = sessionInfo(SCHEDULE[d.getDay()], week).kind;
        const done = logs[iso]?.done;
        const isToday = iso === today;
        return (
          <li key={iso}>
            <button
              type="button"
              className={`${s.day} ${isToday ? s.today : ''} ${done ? s.done : ''}`}
              onClick={() => nav.open({ type: 'day', date: iso })}
              aria-label={`${shortDate(d)}: ${sessionInfo(SCHEDULE[d.getDay()], week).title}${done ? ', hecha' : ''}`}
              style={{ ['--kind' as string]: KIND_COLOR[kind] }}
            >
              <span className={s.letter}>{DAY_SHORT[d.getDay()]}</span>
              <span className={`num ${s.date}`}>{d.getDate()}</span>
              <span className={`${s.mark} ${kind === 'rest' ? s.rest : ''}`}>{done && <Icon name="check" size={14} />}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
