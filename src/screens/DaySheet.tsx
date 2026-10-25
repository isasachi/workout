import { DAY_NAMES } from '../data/plan';
import { Overlay } from '../components/Overlay';
import { SessionPreview } from '../components/SessionPreview';
import { isoDay, shortDate } from '../lib/dates';
import { removeLog, useStore } from '../lib/store';
import { useDay, useNow } from '../lib/today';
import { useNav } from '../nav';
import s from './DaySheet.module.css';

export default function DaySheet({ date }: { date: string }) {
  const nav = useNav();
  const day = useDay(date);
  const now = useNow();
  const log = useStore((st) => st.logs[date]);
  const isFuture = date > isoDay(now);
  const { info } = day;

  return (
    <Overlay title={`${DAY_NAMES[day.date.getDay()]} ${day.start ? shortDate(day.date) : ''}`.trim()} meta={`Semana ${day.pos.week}`}>
      <div className={s.screen}>
        <header className={s.head}>
          <h1 className={s.h1}>{info.title}</h1>
          <p className={s.meta}>{info.kind === 'rest' ? info.subtitle : `${info.subtitle} · ${info.duration} · ${info.intensity}`}</p>
        </header>
        {info.kind !== 'rest' && (
          <div className={s.actions}>
            {log?.done ? (
              <>
                <p className={s.done}>Hecha{log.minutes ? `: ${log.minutes} min` : ''}.</p>
                <button type="button" className="btn btn-secondary" onClick={() => nav.open({ type: 'session', session: day.id, date })}>Editar registro</button>
                <button type="button" className="btn btn-quiet" onClick={() => removeLog(date)}>Borrar registro</button>
              </>
            ) : isFuture ? (
              <p className={s.meta}>Podrás registrarla ese día.</p>
            ) : (
              <button type="button" className="btn btn-primary btn-block" onClick={() => nav.open({ type: 'session', session: day.id, date })}>
                {date === isoDay(now) ? 'Empezar' : 'Registrar esta sesión'}
              </button>
            )}
          </div>
        )}
        <SessionPreview id={day.id} week={day.pos.week} />
      </div>
    </Overlay>
  );
}
