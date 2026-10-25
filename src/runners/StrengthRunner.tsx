import { useMemo, useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { STRENGTH, WARMUP, phaseOf, setsFor, type Slot } from '../data/plan';
import { DemoPlayer } from '../demo/DemoPlayer';
import { Overlay } from '../components/Overlay';
import { ExerciseRow } from '../components/ExerciseRow';
import { VariantPicker } from '../components/VariantPicker';
import { DRILLS } from '../data/exercises';
import { TechniqueNotes } from '../screens/ExerciseSheet';
import { slotDose } from '../components/SessionPreview';
import { formatValues, historyOf, levelOf, readyToLevelUp, type Entry } from '../lib/progress';
import { saveLog, setLevel, useStore, type SetLog } from '../lib/store';
import { useDay } from '../lib/today';
import { useNav } from '../nav';
import { SetRow } from './SetRow';
import { beep, clock, unlockAudio, useCountdown } from './common';
import s from './Runner.module.css';

const REST_MS = 90_000;

function fit(values: (number | null)[], n: number) {
  return Array.from({ length: Math.max(n, values.filter((v) => v !== null).length) }, (_, i) => values[i] ?? null);
}

export default function StrengthRunner({ session, date }: { session: 'A' | 'B'; date: string }) {
  const nav = useNav();
  const st = useStore((x) => x);
  const { pos } = useDay(date);
  const week = pos.week;
  const slots = STRENGTH[session];
  const existing = st.logs[date];

  const [sets, setSets] = useState<Record<string, SetLog>>(() => {
    const out: Record<string, SetLog> = {};
    for (const slot of slots) {
      const prev = existing?.session === session ? existing.sets?.[slot.exercise] : undefined;
      out[slot.exercise] = {
        level: prev?.level ?? levelOf(st, slot.exercise),
        values: fit(prev?.values ?? [], setsFor(slot, week)),
      };
    }
    return out;
  });

  const [step, setStep] = useState(() => {
    if (existing?.session !== session || existing.done) return 0;
    const i = slots.findIndex((sl) => sets[sl.exercise].values.some((v) => v === null));
    return i === -1 ? slots.length + 1 : i + 1;
  });

  // History without today's entry, so today's numbers do not count as "last time".
  const pastLogs = useMemo(() => {
    const l = { ...st.logs };
    delete l[date];
    return l;
  }, [st.logs, date]);

  const rest = useCountdown(() => beep(2));

  const commit = (next: Record<string, SetLog>, done = existing?.done ?? false) => {
    setSets(next);
    saveLog({ date, session, cycle: pos.cycle, week, done, sets: next });
  };

  const total = slots.length + 2;
  const last = total - 1;
  const go = (i: number) => {
    setStep(Math.max(0, Math.min(last, i)));
  };

  const footer = (
    <div className={s.footer}>
      {rest.active && (
        <div className={s.rest} role="timer" aria-live="off">
          <span className={s.restText}>
            <span className={s.restLabel}>Descansa</span>
            <span className={`num ${s.restTime}`}>{clock(rest.left)}</span>
            <span className={s.restHint}>{rest.left > 30_000 ? 'Puedes seguir a partir de 1:00' : 'Prepárate para la siguiente serie'}</span>
          </span>
          <button type="button" className="btn btn-secondary" onClick={rest.stop}>Saltar</button>
        </div>
      )}
      <div className={s.navRow}>
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => go(step - 1)}>Atrás</button>
        )}
        {step < last ? (
          <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
            {step === 0 ? 'Empezar ejercicios' : step === slots.length ? 'Ver resumen' : 'Siguiente ejercicio'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              commit(sets, true);
              nav.close();
            }}
          >
            Guardar y terminar
          </button>
        )}
      </div>
    </div>
  );

  const title = session === 'A' ? 'Fuerza A' : 'Fuerza B';
  let body;
  if (step === 0) {
    body = (
      <div className={s.screen}>
        <h1 className={s.h1}>Calentamiento</h1>
        <p className={s.lead}>Diez minutos para preparar articulaciones sin cansarte. Toca cada uno para ver la demo.</p>
        <ul className="list">
          {WARMUP.items.map((it) => (
            <li key={it.drill}>
              <ExerciseRow move={DRILLS[it.drill].move} name={DRILLS[it.drill].name} detail={it.dose}
                onClick={() => nav.open({ type: 'exercise', exercise: it.drill })} />
            </li>
          ))}
        </ul>
        <p className={s.note}>{WARMUP.last}</p>
      </div>
    );
  } else if (step <= slots.length) {
    const slot = slots[step - 1];
    body = (
      <ExerciseStep
        key={slot.exercise}
        slot={slot}
        week={week}
        log={sets[slot.exercise]}
        history={historyOf(pastLogs, slot.exercise)}
        onChange={(log, setDone) => {
          commit({ ...sets, [slot.exercise]: log });
          if (setDone) {
            unlockAudio();
            rest.start(REST_MS);
          }
        }}
      />
    );
  } else {
    body = (
      <div className={s.screen}>
        <h1 className={s.h1}>Resumen</h1>
        <ul className="list">
          {slots.map((slot) => {
            const ex = EXERCISES[slot.exercise];
            const lg = sets[slot.exercise];
            const v = ex.ladder[lg.level];
            const txt = formatValues(lg.values, ex.metric);
            return (
              <li key={slot.exercise} className={s.sumRow}>
                <span className={s.sumName}>{v.name}</span>
                <span className={`num ${s.sumVal}`}>{txt || 'Sin anotar'}</span>
              </li>
            );
          })}
        </ul>
        <p className={s.note}>Todo queda guardado en este teléfono. Puedes volver a editarlo desde Hoy o desde el Plan.</p>
      </div>
    );
  }

  return (
    <Overlay title={title} meta={`Paso ${step + 1} de ${total}`} footer={footer} scrollKey={step}>
      {body}
    </Overlay>
  );
}

type StepProps = {
  slot: Slot;
  week: number;
  log: SetLog;
  history: Entry[];
  onChange: (log: SetLog, setDone: boolean) => void;
};

function ExerciseStep({ slot, week, log, history, onChange }: StepProps) {
  const ex = EXERCISES[slot.exercise];
  const v = ex.ladder[log.level];
  const lastSame = history.find((e) => e.level === log.level);
  const ready = readyToLevelUp(history, slot, log.level, setsFor(slot, week));
  const [showNotes, setShowNotes] = useState(false);

  const changeLevel = (l: number) => {
    setLevel(slot.exercise, l);
    onChange({ ...log, level: l }, false);
  };

  return (
    <div className={s.screen}>
      <DemoPlayer key={v.id} moveId={v.move} pause={v.pause} label={v.name} className={s.demo} />
      <div className={s.titleBlock}>
        <h1 className={s.h1}>{v.name}</h1>
        <p className={s.dose}>
          <span className="num">{slotDose(slot, week)}</span> · RIR {phaseOf(week).rir}
        </p>
        {slot.note && <p className={s.slotNote}>{slot.note}</p>}
      </div>

      {ready && (
        <p className={s.levelUp}>
          La última vez llegaste al tope del rango en todas las series. Prueba «{ex.ladder[log.level + 1].name}» y vuelve al número bajo de repeticiones.
        </p>
      )}

      <ol className={s.sets}>
        {log.values.map((val, i) => (
          <li key={i}>
            <SetRow
              index={i}
              metric={ex.metric}
              value={val}
              suggested={lastSame?.values[i] ?? slot.reps[0]}
              range={slot.reps}
              perSide={ex.perSide}
              onLog={(nv) => {
                const values = [...log.values];
                values[i] = nv;
                onChange({ ...log, values }, nv !== null);
              }}
            />
          </li>
        ))}
      </ol>
      {lastSame && <p className={s.note}>La última vez con esta variante: <span className="num">{formatValues(lastSame.values, ex.metric)}</span></p>}

      <section className={s.variant}>
        <h2 className={s.h2}>¿Muy difícil o muy fácil?</h2>
        <VariantPicker exercise={ex} value={log.level} current={log.level} onChange={changeLevel} />
      </section>

      <button type="button" className={s.disclosure} aria-expanded={showNotes} onClick={() => setShowNotes((x) => !x)}>
        {showNotes ? 'Ocultar claves y errores' : 'Ver claves y errores comunes'}
      </button>
      {showNotes && <TechniqueNotes cues={v.cues} mistakes={v.mistakes} />}
    </div>
  );
}
