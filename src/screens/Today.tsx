import { DAY_NAMES, KIND_COLOR, SCHEDULE, STRENGTH, cardioMinutes, hiitFor, hiitTotal, sessionInfo, phaseOf, type SessionId } from '../data/plan';
import { EXERCISES } from '../data/exercises';
import { DemoPlayer } from '../demo/DemoPlayer';
import { SessionPreview } from '../components/SessionPreview';
import { ExerciseRow } from '../components/ExerciseRow';
import { addDays, isoDay, nextMonday, parseDay, shortDate } from '../lib/dates';
import { levelOf } from '../lib/progress';
import { setStartDate, useStore, type State } from '../lib/store';
import { useDay, useNow } from '../lib/today';
import { useNav } from '../nav';
import { Icon } from '../components/Icon';
import { WeekStrip } from '../components/WeekStrip';
import s from './Today.module.css';

export function heroFor(id: SessionId, st: State): { move: string; pause?: boolean; label: string } | null {
  if (id === 'A' || id === 'B') {
    const slot = STRENGTH[id][0];
    const v = EXERCISES[slot.exercise].ladder[levelOf(st, slot.exercise)];
    return { move: v.move, pause: v.pause, label: `Primer ejercicio: ${v.name}` };
  }
  if (id === 'cardio' || id === 'recovery') return { move: 'walk', label: 'Caminata' };
  if (id === 'hiit') return { move: 'high-knees', label: 'Rodillas altas' };
  return null;
}

/** Three headline numbers for the session, read before starting. */
function statsFor(id: SessionId, week: number): { value: string; label: string }[] {
  const ph = phaseOf(week);
  switch (id) {
    case 'A':
    case 'B':
      return [
        { value: '35–45', label: 'Minutos' },
        { value: String(STRENGTH[id].length), label: 'Ejercicios' },
        { value: ph.rir, label: 'RIR' },
      ];
    case 'cardio':
      return [
        { value: String(cardioMinutes(week)), label: 'Minutos' },
        { value: '4–5', label: 'RPE' },
        { value: '3', label: 'Opciones' },
      ];
    case 'hiit': {
      const h = hiitFor(week);
      return [
        { value: String(hiitTotal(h)), label: 'Minutos' },
        { value: `${h.blocks}×${h.hard}`, label: 'Bloques' },
        { value: '8', label: 'RPE' },
      ];
    }
    case 'recovery':
      return [
        { value: '20–30', label: 'Minutos' },
        { value: '3', label: 'Movilidad' },
        { value: '2–3', label: 'RPE' },
      ];
    default:
      return [];
  }
}

function StartCard() {
  const now = useNow();
  const monday = nextMonday(now);
  return (
    <section className={s.startCard}>
      <h2 className={`display ${s.startTitle}`}>¿Cuándo empiezas las 8 semanas?</h2>
      <div className={s.startActions}>
        <button type="button" className="btn btn-primary" onClick={() => setStartDate(isoDay(now))}>
          Hoy
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => setStartDate(monday)}>
          Lunes {shortDate(parseDay(monday))}
        </button>
      </div>
    </section>
  );
}

export function Today() {
  const now = useNow();
  const today = isoDay(now);
  const st = useStore((x) => x);
  const day = useDay(today);
  const nav = useNav();
  const log = st.logs[today];
  const notYet = !!st.startDate && !day.pos.started;

  if (!st.loaded) return <div className={s.skeleton} aria-busy="true" />;

  // Before the start date, preview the first day instead of today.
  if (notYet) {
    const first = parseDay(st.startDate!);
    const firstId = SCHEDULE[first.getDay()];
    const info = sessionInfo(firstId, 1);
    return (
      <div className={s.screen}>
        <header className={s.head}>
          <h1 className={`display ${s.title}`}>Empiezas el {DAY_NAMES[first.getDay()].toLowerCase()} {shortDate(first)}</h1>
          <p className={s.meta}>Primer día: {info.title} · {info.duration}</p>
          <p className={s.date}>Hoy es {DAY_NAMES[now.getDay()].toLowerCase()} {shortDate(now)}</p>
        </header>
        <ul className="list">
          <li>
            <ExerciseRow move={heroFor(firstId, st)?.move ?? 'walk'} name={info.title} detail={info.subtitle}
              onClick={() => nav.open({ type: 'day', date: st.startDate! })} />
          </li>
        </ul>
        <button type="button" className="btn btn-quiet" onClick={() => setStartDate(today)}>Empezar hoy en su lugar</button>
      </div>
    );
  }

  const { info, pos } = day;
  const hero = heroFor(day.id, st);
  const ph = phaseOf(pos.week);
  const tomorrow = addDays(now, 1);
  const tomorrowInfo = sessionInfo(SCHEDULE[tomorrow.getDay()], pos.week);
  const anyLogged = !!log && (log.done || Object.values(log.sets ?? {}).some((x) => x.values.some((v) => v !== null)));

  const stats = statsFor(day.id, pos.week);

  return (
    <div className={s.screen}>
      {!st.startDate && <StartCard />}
      <header className={s.head}>
        <h1 className={`display ${s.title}`}>{info.title}</h1>
        <p className={s.meta}>
          <span className={s.dot} style={{ background: KIND_COLOR[info.kind] }} aria-hidden="true" />
          {info.subtitle}
        </p>
        <p className={s.date}>
          {DAY_NAMES[now.getDay()]} {shortDate(now)} · Semana {pos.week} de 8 · {phaseOf(pos.week).name}{pos.cycle > 1 ? ` · Ciclo ${pos.cycle}` : ''}
        </p>
      </header>

      <WeekStrip now={now} cycle={pos.cycle} week={pos.week} started={pos.started} />

      {hero && (
        <section className={`${s.hero} ${!st.startDate ? s.compact : ''}`}>
          <DemoPlayer moveId={hero.move} pause={hero.pause} label={hero.label} cues={false} />
          {stats.length > 0 && (
            <dl className={s.stats}>
              {stats.map((x) => (
                <div key={x.label} className={s.stat}>
                  <dt>{x.label}</dt>
                  <dd className="num">{x.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {log?.done ? (
            <div className={s.done}>
              <p className={`display ${s.doneText}`}>Sesión hecha</p>
              <button type="button" className="btn btn-secondary btn-block" onClick={() => nav.open({ type: 'session', session: day.id, date: today })}>
                Ver o editar el registro
              </button>
            </div>
          ) : (
            <button type="button" className={`btn btn-primary btn-block ${s.start}`} onClick={() => nav.open({ type: 'session', session: day.id, date: today })}>
              <Icon name="play" size={22} />
              {anyLogged ? 'Continuar' : 'Empezar'}
            </button>
          )}
          {info.kind === 'recovery' && !log?.done && <p className={s.hint}>Hoy es opcional. Si estás cansado, descansa.</p>}
        </section>
      )}

      <SessionPreview id={day.id} week={pos.week} />

      {info.kind === 'rest' && (
        <section className={s.next}>
          <h2 className={`display ${s.h2}`}>Mañana</h2>
          <ul className="list">
            <li>
              <ExerciseRow move={heroFor(SCHEDULE[tomorrow.getDay()], st)?.move ?? 'walk'} name={tomorrowInfo.title} detail={`${tomorrowInfo.duration} · ${tomorrowInfo.intensity}`}
                onClick={() => nav.open({ type: 'day', date: isoDay(tomorrow) })} />
            </li>
          </ul>
        </section>
      )}

      <p className={s.phase}>
        {ph.name}: {ph.focus.charAt(0).toLowerCase() + ph.focus.slice(1)}.
      </p>
    </div>
  );
}
