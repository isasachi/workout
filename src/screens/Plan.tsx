import { useState } from 'react';
import { DAY_NAMES, KIND_COLOR, PHASES, SCHEDULE, sessionInfo } from '../data/plan';
import { GUIDE } from '../data/guide';
import { Icon } from '../components/Icon';
import { addDays, datesOfWeek, isoDay, mondayOf, shortDate, weekPos } from '../lib/dates';
import { useStore } from '../lib/store';
import { useNow } from '../lib/today';
import { useNav } from '../nav';
import s from './Plan.module.css';

export default function Plan() {
  const nav = useNav();
  const now = useNow();
  const start = useStore((st) => st.startDate);
  const logs = useStore((st) => st.logs);
  const here = weekPos(start, now);
  const [week, setWeek] = useState(here.week);
  const cycle = here.cycle;
  const days = start ? datesOfWeek(start, cycle, week) : Array.from({ length: 7 }, (_, i) => addDays(mondayOf(now), i));
  const today = isoDay(now);

  return (
    <div className={s.screen}>
      <header className={s.head}>
        <h1 className={s.title}>Plan</h1>
        <p className={s.meta}>8 semanas en casa, sin material{cycle > 1 ? ` · Ciclo ${cycle}` : ''}</p>
      </header>

      <div className={s.weeks} role="tablist" aria-label="Semana">
        {Array.from({ length: 8 }, (_, i) => i + 1).map((w) => (
          <button key={w} type="button" role="tab" aria-selected={w === week} className={s.week} onClick={() => setWeek(w)}>
            <span className={s.weekLabel}>S{w}</span>
            {here.started && w === here.week && <span className={s.nowDot} aria-label="semana actual" />}
          </button>
        ))}
      </div>

      <section className={s.section}>
        <h2 className={s.h2}>
          Semana {week} · {PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1])!.name}
        </h2>
        <ul className="list">
          {days.map((d) => {
            const id = SCHEDULE[d.getDay()];
            const info = sessionInfo(id, week);
            const iso = isoDay(d);
            const done = logs[iso]?.done;
            return (
              <li key={iso}>
                <button type="button" className={s.day} onClick={() => nav.open({ type: 'day', date: iso })}>
                  <span className={s.dot} style={{ background: KIND_COLOR[info.kind] }} aria-hidden="true" />
                  <span className={s.dayText}>
                    <span className={s.dayName}>
                      {DAY_NAMES[d.getDay()]}
                      {start && <span className={s.dayDate}> · {shortDate(d)}</span>}
                      {iso === today && <span className={s.today}> · hoy</span>}
                    </span>
                    <span className={s.session}>{info.title}{info.kind !== 'rest' ? ` · ${info.duration}` : ''}</span>
                  </span>
                  {done && <span className={s.check} aria-label="hecha"><Icon name="check" size={20} /></span>}
                  <span className={s.chev}><Icon name="chevron" size={20} /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Cómo sube el plan</h2>
        <ul className="list">
          {PHASES.map((p) => (
            <li key={p.name} className={s.phase}>
              <span className={`num ${s.phaseWeeks}`}>{p.weeks[0] === p.weeks[1] ? `S${p.weeks[0]}` : `S${p.weeks[0]}–${p.weeks[1]}`}</span>
              <span className={s.phaseText}>
                <span className={s.phaseName}>{p.name} · RIR {p.rir}</span>
                <span className={s.phaseFocus}>{p.focus}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className={s.note}>Al terminar la semana 8, el ciclo vuelve a empezar con variantes más difíciles.</p>
      </section>

      <section className={s.section}>
        <h2 className={s.h2}>Guía</h2>
        <div className={s.guide}>
          {GUIDE.map((g) => (
            <details key={g.id} className={s.item}>
              <summary className={s.summary}>
                {g.title}
                <Icon name="chevron" size={20} />
              </summary>
              <div className={s.body}>
                {g.body.map((p) => <p key={p}>{p}</p>)}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
