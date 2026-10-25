import { useState } from 'react';
import { DRILLS, EXERCISES } from '../data/exercises';
import {
  CARDIO_OPTIONS, HIIT_HOME, RECOVERY, STRENGTH, WARMUP, cardioMinutes, hiitFor, phaseOf, setsFor,
  type SessionId, type Slot,
} from '../data/plan';
import { levelOf } from '../lib/progress';
import { useStore } from '../lib/store';
import { useNav } from '../nav';
import { ExerciseRow } from './ExerciseRow';
import s from './SessionPreview.module.css';

export function slotDose(slot: Slot, week: number) {
  const ex = EXERCISES[slot.exercise];
  const [lo, hi] = slot.reps;
  const range = lo === hi ? `${lo}` : `${lo}–${hi}`;
  const unit = ex.metric === 'secs' ? '\u00a0s' : '';
  return `${setsFor(slot, week)} × ${range}${unit}${ex.perSide ? ' por\u00a0lado' : ''}`;
}

export function StrengthList({ id, week }: { id: 'A' | 'B'; week: number }) {
  const nav = useNav();
  const levels = useStore((st) => st);
  return (
    <ul className="list">
      {STRENGTH[id].map((slot) => {
        const ex = EXERCISES[slot.exercise];
        const v = ex.ladder[levelOf(levels, slot.exercise)];
        return (
          <li key={slot.exercise}>
            <ExerciseRow
              move={v.move}
              pause={v.pause}
              name={v.name}
              detail={[slotDose(slot, week), slot.note].filter(Boolean).join(' · ')}
              onClick={() => nav.open({ type: 'exercise', exercise: slot.exercise })}
            />
          </li>
        );
      })}
    </ul>
  );
}

function DrillList({ items }: { items: { drill: string; dose: string; name?: string }[] }) {
  const nav = useNav();
  return (
    <ul className="list">
      {items.map((it) => {
        const d = DRILLS[it.drill];
        return (
          <li key={it.drill}>
            <ExerciseRow move={d.move} name={it.name ?? d.name} detail={it.dose} onClick={() => nav.open({ type: 'exercise', exercise: it.drill })} />
          </li>
        );
      })}
    </ul>
  );
}

function Warmup() {
  const [open, setOpen] = useState(false);
  return (
    <section className={s.section}>
      <div className={s.rowHead}>
        <h2 className={s.h2}>Calentamiento</h2>
        <button type="button" className="btn btn-quiet" aria-expanded={open} onClick={() => setOpen((x) => !x)}>
          {open ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      {open ? <DrillList items={WARMUP.items} /> : <p className={s.note}>10 min y {WARMUP.items.length} movimientos antes de empezar: marcha, movilidad y activación, sin cansarte. La sesión guiada te lo muestra paso a paso.</p>}
      {open && <p className={s.note}>{WARMUP.last}</p>}
    </section>
  );
}

export function SessionPreview({ id, week }: { id: SessionId; week: number }) {
  switch (id) {
    case 'A':
    case 'B':
      return (
        <div className={s.stack}>
          <section className={s.section}>
            <h2 className={s.h2}>Ejercicios</h2>
            <StrengthList id={id} week={week} />
            <p className={s.note}>Descansa 60–90 s entre series. RIR {phaseOf(week).rir}: termina cada serie cuando aún podrías hacer {phaseOf(week).rir} repeticiones más.</p>
          </section>
          <Warmup />
        </div>
      );
    case 'cardio':
      return (
        <section className={s.section}>
          <h2 className={s.h2}>Elige cómo hacerlo</h2>
          <DrillList items={CARDIO_OPTIONS.map((o) => ({ drill: o.drills[0], name: o.name, dose: o.detail }))} />
          <p className={s.note}>
            {cardioMinutes(week)} min continuos: 5 min subiendo el ritmo, el resto estable y 5 min de vuelta a la calma. Si no puedes hablar en frases, baja el ritmo.
          </p>
        </section>
      );
    case 'hiit': {
      const h = hiitFor(week);
      return (
        <div className={s.stack}>
          <section className={s.section}>
            <h2 className={s.h2}>Estructura</h2>
            <ul className={`list ${s.steps}`}>
              <li><span>Calentamiento progresivo</span><span className="num">{h.warm} min</span></li>
              <li><span>Bloque fuerte, RPE 8</span><span className="num">{h.blocks} × {h.hard} min</span></li>
              <li><span>Recuperación caminando entre bloques</span><span className="num">{h.blocks - 1} × {h.easy} min</span></li>
              <li><span>Vuelta a la calma</span><span className="num">{h.cool} min</span></li>
            </ul>
          </section>
          <section className={s.section}>
            <h2 className={s.h2}>En casa: 30 s de cada uno, sin parar</h2>
            <DrillList items={HIIT_HOME.map((d) => ({ drill: d, dose: '30\u00a0s' }))} />
            <p className={s.note}>Fuera de casa: caminata muy rápida o trote suave cuesta arriba, o escaleras rápido, y bajas caminando para recuperar. Sin saltos las primeras 4 semanas.</p>
          </section>
        </div>
      );
    }
    case 'recovery':
      return (
        <div className={s.stack}>
          <section className={s.section}>
            <h2 className={s.h2}>Caminata suave</h2>
            <DrillList items={[{ drill: 'walk', dose: '20–30 min, ritmo cómodo' }]} />
          </section>
          <section className={s.section}>
            <h2 className={s.h2}>Movilidad · 10 min</h2>
            <DrillList items={RECOVERY.items} />
            <p className={s.note}>Si estás cansado o con poco tiempo, descánsalo sin culpa.</p>
          </section>
        </div>
      );
    default:
      return <p className={s.rest}>Descanso total. Si te sobra energía, mejor añadir repeticiones otro día que sumar sesiones.</p>;
  }
}
