import { useState } from 'react';
import { CARDIO_OPTIONS, cardioMinutes } from '../data/plan';
import { DRILLS } from '../data/exercises';
import { DemoPlayer } from '../demo/DemoPlayer';
import { Overlay } from '../components/Overlay';
import { removeLog, saveLog, useStore } from '../lib/store';
import { useDay } from '../lib/today';
import { useNav } from '../nav';
import { clock, unlockAudio, useStopwatch } from './common';
import s from './Runner.module.css';

function stage(min: number, target: number) {
  if (min < 5) return { name: 'Calienta', hint: 'Empieza suave y ve subiendo el ritmo poco a poco.' };
  if (min < target - 5) return { name: 'Ritmo estable', hint: 'Respiras más rápido, pero puedes hablar en frases completas.' };
  if (min < target) return { name: 'Vuelta a la calma', hint: 'Baja el ritmo para terminar suave.' };
  return { name: 'Tiempo cumplido', hint: 'Termina y guarda. Si te sientes bien, puedes seguir unos minutos.' };
}

export default function CardioRunner({ date }: { date: string }) {
  const nav = useNav();
  const { pos } = useDay(date);
  const log = useStore((st) => st.logs[date]);
  const target = cardioMinutes(pos.week);
  const [option, setOption] = useState(log?.option ?? 'walk');
  const watch = useStopwatch();
  const opt = CARDIO_OPTIONS.find((o) => o.id === option) ?? CARDIO_OPTIONS[0];
  const min = watch.elapsed / 60000;
  const drill = opt.rotateMin ? opt.drills[Math.floor(min / opt.rotateMin) % opt.drills.length] : opt.drills[0];
  const st = stage(min, target);
  const done = log?.done && log.session === 'cardio';

  const save = (minutes: number) => {
    saveLog({ date, session: 'cardio', cycle: pos.cycle, week: pos.week, done: true, minutes, option });
    nav.close();
  };

  const toggle = () => {
    unlockAudio();
    if (watch.running) watch.pause();
    else watch.start();
  };

  const footer = (
    <div className={s.footer}>
      <button type="button" className={`btn ${watch.running ? 'btn-secondary' : 'btn-primary'} btn-block`} onClick={toggle}>
        {watch.running ? 'Pausar' : watch.elapsed > 0 ? 'Seguir' : 'Empezar'}
      </button>
      {watch.elapsed > 0 ? (
        <button type="button" className="btn btn-quiet" onClick={() => save(Math.max(1, Math.round(min)))}>
          Terminar y guardar {Math.max(1, Math.round(min))}&nbsp;min
        </button>
      ) : (
        <button type="button" className="btn btn-quiet" onClick={() => save(target)}>
          Lo hice sin el móvil: guardar {target}&nbsp;min
        </button>
      )}
    </div>
  );

  return (
    <Overlay title="Cardio moderado" meta={`${target} min · RPE 4–5`} footer={footer}>
      <div className={s.screen}>
        {done && (
          <div className={s.doneBanner}>
            Hecho: {log!.minutes} min. Puedes repetir el registro o{' '}
            <button type="button" className="btn btn-quiet" onClick={() => { removeLog(date); }}>borrarlo</button>
          </div>
        )}
        <div className={s.chips} role="group" aria-label="Cómo hacerlo">
          {CARDIO_OPTIONS.map((o) => (
            <button key={o.id} type="button" className={s.chip} aria-pressed={o.id === option} onClick={() => setOption(o.id)} disabled={watch.running}>
              {o.short}
            </button>
          ))}
        </div>
        <p className={s.note}>{opt.rotateMin ? `${opt.detail} Ahora: ${DRILLS[drill].name}.` : opt.detail}</p>
        <DemoPlayer key={drill} moveId={DRILLS[drill].move} label={DRILLS[drill].name} className={s.demo} />
        <div className={s.timerBlock} role="timer">
          <span className={`num ${s.bigTime}`}>{clock(watch.elapsed)}</span>
          <span className={s.timerSub}>de {target}:00</span>
        </div>
        <div className={s.bar}>
          <div className={s.barFill} style={{ width: `${Math.min(100, (min / target) * 100)}%` }} />
        </div>
        <p className={s.phase}>{st.name}</p>
        <p className={s.phaseHint}>{st.hint}</p>
      </div>
    </Overlay>
  );
}
