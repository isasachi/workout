import { useState } from 'react';
import { RECOVERY } from '../data/plan';
import { DRILLS } from '../data/exercises';
import { Overlay } from '../components/Overlay';
import { ExerciseRow } from '../components/ExerciseRow';
import { Icon } from '../components/Icon';
import { saveLog, useStore } from '../lib/store';
import { useDay } from '../lib/today';
import { useNav } from '../nav';
import s from './Runner.module.css';

export default function RecoveryRunner({ date }: { date: string }) {
  const nav = useNav();
  const { pos } = useDay(date);
  const log = useStore((st) => st.logs[date]);
  const [minutes, setMinutes] = useState(log?.minutes ?? 20);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const footer = (
    <div className={s.footer}>
      <div className={s.navRow}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            saveLog({ date, session: 'recovery', cycle: pos.cycle, week: pos.week, done: true, minutes });
            nav.close();
          }}
        >
          Guardar como hecha
        </button>
      </div>
    </div>
  );

  return (
    <Overlay title="Recuperación activa" meta="Opcional · muy suave" footer={footer}>
      <div className={s.screen}>
        <h1 className={s.h1}>Caminata suave</h1>
        <p className={s.lead}>{RECOVERY.walk}</p>
        <div className={s.chips} role="group" aria-label="Minutos caminados">
          {[20, 25, 30].map((m) => (
            <button key={m} type="button" className={s.chip} aria-pressed={minutes === m} onClick={() => setMinutes(m)}>
              {m} min
            </button>
          ))}
        </div>

        <h2 className={s.h1}>Movilidad</h2>
        <ul className="list">
          {RECOVERY.items.map((it) => {
            const on = !!checked[it.drill];
            return (
              <li key={it.drill} className={s.doRow}>
                <ExerciseRow move={DRILLS[it.drill].move} name={DRILLS[it.drill].name} detail={it.dose}
                  onClick={() => nav.open({ type: 'exercise', exercise: it.drill })} chevron={false} />
                <button type="button" className={`${s.doCheck} ${on ? s.doCheckOn : ''}`} aria-pressed={on}
                  aria-label={`${DRILLS[it.drill].name} hecho`} onClick={() => setChecked((c) => ({ ...c, [it.drill]: !on }))}>
                  <Icon name="check" size={24} />
                </button>
              </li>
            );
          })}
        </ul>
        <p className={s.note}>Toca un movimiento para ver la demo; marca el círculo cuando lo termines.</p>
      </div>
    </Overlay>
  );
}
