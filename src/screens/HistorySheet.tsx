import { EXERCISES } from '../data/exercises';
import { Overlay } from '../components/Overlay';
import { parseDay, shortDate } from '../lib/dates';
import { formatValues, historyOf, levelOf } from '../lib/progress';
import { useStore } from '../lib/store';
import { useNav } from '../nav';
import s from './HistorySheet.module.css';

export default function HistorySheet({ exercise }: { exercise: string }) {
  const nav = useNav();
  const ex = EXERCISES[exercise];
  const st = useStore((x) => x);
  const hist = historyOf(st.logs, exercise);
  const level = levelOf(st, exercise);
  const best = Math.max(0, ...hist.filter((h) => h.level === level).flatMap((h) => h.values.filter((v): v is number => v !== null)));

  return (
    <Overlay title={ex.name} meta={ex.works}>
      <div className={s.screen}>
        <header className={s.head}>
          <h1 className={s.h1}>{ex.ladder[level].name}</h1>
          <p className={s.meta}>
            Nivel {level + 1} de {ex.ladder.length}
            {best > 0 && <> · mejor serie: <span className="num">{best}{ex.metric === 'secs' ? ' s' : ''}</span></>}
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => nav.open({ type: 'exercise', exercise })}>
            Ver técnica y cambiar variante
          </button>
        </header>
        {hist.length === 0 ? (
          <p className={s.meta}>Aún no hay registros. Aparecerán aquí al marcar tus series durante una sesión de fuerza.</p>
        ) : (
          <ul className="list">
            {hist.map((h) => (
              <li key={h.date} className={s.row}>
                <span className={s.rowText}>
                  <span className={s.date}>{shortDate(parseDay(h.date))}</span>
                  <span className={s.variant}>{ex.ladder[h.level].name}</span>
                </span>
                <span className={`num ${s.values}`}>{formatValues(h.values, ex.metric)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Overlay>
  );
}
