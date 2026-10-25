import { useEffect, useMemo, useRef, useState } from 'react';
import { HIIT_HOME, hiitFor, hiitTotal } from '../data/plan';
import { DRILLS } from '../data/exercises';
import { DemoPlayer } from '../demo/DemoPlayer';
import { Overlay } from '../components/Overlay';
import { saveLog, useStore } from '../lib/store';
import { useDay } from '../lib/today';
import { useNav } from '../nav';
import { beep, clock, unlockAudio, useStopwatch } from './common';
import s from './Runner.module.css';

type Phase = { kind: 'warm' | 'hard' | 'easy' | 'cool'; ms: number; block?: number };

function buildPhases(week: number): Phase[] {
  const h = hiitFor(week);
  const out: Phase[] = [{ kind: 'warm', ms: h.warm * 60000 }];
  for (let b = 0; b < h.blocks; b++) {
    out.push({ kind: 'hard', ms: h.hard * 60000, block: b });
    if (b < h.blocks - 1) out.push({ kind: 'easy', ms: h.easy * 60000, block: b });
  }
  out.push({ kind: 'cool', ms: h.cool * 60000 });
  return out;
}

const LABEL: Record<Phase['kind'], string> = {
  warm: 'Calentamiento',
  hard: 'Bloque fuerte',
  easy: 'Recupera caminando',
  cool: 'Vuelta a la calma',
};

export default function HiitRunner({ date }: { date: string }) {
  const nav = useNav();
  const { pos } = useDay(date);
  const log = useStore((st) => st.logs[date]);
  const [where, setWhere] = useState<'home' | 'out'>((log?.option as 'home' | 'out') ?? 'home');
  const phases = useMemo(() => buildPhases(pos.week), [pos.week]);
  const totalMs = phases.reduce((a, p) => a + p.ms, 0);
  const [skip, setSkip] = useState(0);
  const watch = useStopwatch();
  const t = Math.min(totalMs, watch.elapsed + skip);

  let acc = 0;
  let idx = phases.length - 1;
  for (let i = 0; i < phases.length; i++) {
    if (t < acc + phases[i].ms) {
      idx = i;
      break;
    }
    acc += phases[i].ms;
  }
  const ph = phases[idx];
  const inPhase = t - acc;
  const left = Math.max(0, ph.ms - inPhase);
  const finished = t >= totalMs;

  // Beep on each change of phase, three times when a hard block starts.
  const lastIdx = useRef(idx);
  useEffect(() => {
    if (idx !== lastIdx.current) {
      beep(phases[idx].kind === 'hard' ? 3 : 1);
      lastIdx.current = idx;
    }
  }, [idx, phases]);

  let drill = 'walk';
  let hint = '';
  if (ph.kind === 'warm') {
    drill = inPhase < ph.ms / 2 ? 'march' : 'jack-step';
    hint = 'Sube poco a poco de muy suave a moderado (RPE 3 → 6).';
  } else if (ph.kind === 'hard') {
    if (where === 'home') {
      drill = HIIT_HOME[Math.floor(inPhase / 30000) % HIIT_HOME.length];
      hint = `${DRILLS[drill].name}: cambia cada 30\u00a0s. Duro pero sostenible (RPE 8).`;
    } else {
      drill = 'high-knees';
      hint = 'Caminata muy rápida o trote suave cuesta arriba, o escaleras rápido. RPE 8.';
    }
  } else if (ph.kind === 'easy') {
    hint = 'Camina para recuperar. Respira hondo.';
  } else {
    hint = 'Camina suave hasta que la respiración vuelva a la normalidad.';
  }
  const nextHome = ph.kind === 'hard' && where === 'home' ? HIIT_HOME[(Math.floor(inPhase / 30000) + 1) % HIIT_HOME.length] : null;
  const hardBlocks = phases.filter((p) => p.kind === 'hard');

  const save = () => {
    saveLog({ date, session: 'hiit', cycle: pos.cycle, week: pos.week, done: true, minutes: Math.max(1, Math.round(t / 60000)), option: where });
    nav.close();
  };

  const footer = (
    <div className={s.footer}>
      <div className={s.navRow}>
        <button
          type="button"
          className={`btn ${watch.running ? 'btn-secondary' : 'btn-primary'}`}
          disabled={finished}
          onClick={() => {
            unlockAudio();
            if (watch.running) watch.pause();
            else watch.start();
          }}
        >
          {watch.running ? 'Pausar' : t > 0 ? 'Seguir' : 'Empezar'}
        </button>
        {t > 0 && !finished && (
          <button type="button" className={`btn btn-secondary ${s.flexNone}`} onClick={() => setSkip((x) => x + left)}>
            Saltar fase
          </button>
        )}
      </div>
      {t > 0 ? (
        <button type="button" className="btn btn-quiet" onClick={save}>Terminar y guardar</button>
      ) : (
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            saveLog({ date, session: 'hiit', cycle: pos.cycle, week: pos.week, done: true, minutes: hiitTotal(hiitFor(pos.week)), option: where });
            nav.close();
          }}
        >
          Lo hice sin el móvil
        </button>
      )}
    </div>
  );

  return (
    <Overlay title="HIIT por intervalos" meta={`${Math.round(totalMs / 60000)} min en total`} footer={footer}>
      <div className={s.screen}>
        {log?.done && log.session === 'hiit' && <div className={s.doneBanner}>Ya registraste esta sesión: {log.minutes} min.</div>}
        <div className={s.chips} role="group" aria-label="Dónde">
          <button type="button" className={s.chip} aria-pressed={where === 'home'} onClick={() => setWhere('home')}>En casa</button>
          <button type="button" className={s.chip} aria-pressed={where === 'out'} onClick={() => setWhere('out')}>Fuera de casa</button>
        </div>

        <p className={s.phase} style={{ color: ph.kind === 'hard' ? 'var(--c-hiit)' : undefined }}>
          {finished ? 'Sesión completada' : ph.kind === 'hard' ? `${LABEL.hard} ${ph.block! + 1} de ${hardBlocks.length}` : LABEL[ph.kind]}
        </p>
        <div className={s.timerBlock} role="timer">
          <span className={`num ${s.bigTime}`}>{clock(finished ? 0 : left)}</span>
          <span className={s.timerSub}>Total {clock(t)} de {clock(totalMs)}</span>
        </div>
        <div className={s.blocks} aria-hidden="true">
          {hardBlocks.map((b) => (
            <span key={b.block} className={`${s.block} ${idx > phases.indexOf(b) ? s.blockDone : ''} ${phases[idx] === b ? s.blockNow : ''}`} />
          ))}
        </div>

        <p className={s.phaseHint}>{hint}</p>
        <DemoPlayer key={drill} moveId={DRILLS[drill].move} label={DRILLS[drill].name} className={s.demo} />
        {nextHome && <p className={s.note}>Después: {DRILLS[nextHome].name}</p>}

        <p className={s.note}>Si el último bloque te resulta imposible, la próxima vez empieza el primero más suave.</p>
      </div>
    </Overlay>
  );
}
