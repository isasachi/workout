import { useEffect, useMemo, useRef, useState } from 'react';
import { Figure } from './Figure';
import { cachedMove, loadMove } from './registry';
import { sample, solve, timeline } from './rig';
import type { Move } from './types';
import { Icon } from '../components/Icon';
import s from './DemoPlayer.module.css';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function useMove(id: string) {
  const [move, setMove] = useState<Move | undefined>(() => cachedMove(id));
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setFailed(false);
    setMove(cachedMove(id));
    loadMove(id).then((m) => alive && setMove(m)).catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [id]);
  return { move, failed };
}

type Props = {
  moveId: string;
  pause?: boolean;
  /** Show the cue line under the figure. */
  cues?: boolean;
  controls?: boolean;
  /** Static frame at the hardest point, for lists. */
  still?: boolean;
  className?: string;
  label: string;
};

export function DemoPlayer({ moveId, pause = false, cues = true, controls = true, still = false, className, label }: Props) {
  const { move, failed } = useMove(moveId);
  const segs = useMemo(() => (move ? timeline(move.keys, pause ? 2000 : 0) : []), [move, pause]);
  const [playing, setPlaying] = useState(() => !still && !reducedMotion());
  const [slow, setSlow] = useState(false);
  const [t, setT] = useState(0);
  const [step, setStep] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !move) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (visible.current && !document.hidden) setT((x) => x + dt * (slow ? 0.5 : 1));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, slow, move]);

  if (failed) return <div className={`${s.box} ${className ?? ''}`}><p className={s.error}>No se pudo cargar la demo.</p></div>;
  if (!move) return <div className={`${s.box} ${s.loading} ${className ?? ''}`} aria-hidden="true" />;

  let pose = move.keys[0].pose;
  let cue: string | undefined;
  if (still) {
    const peak = move.keys.find((k) => k.peak) ?? move.keys[Math.min(1, move.keys.length - 1)];
    pose = peak.pose;
  } else if (playing) {
    const r = sample(move.keys, segs, t);
    pose = r.pose;
    cue = r.cue;
  } else {
    const k = move.keys[step % move.keys.length];
    pose = k.pose;
    cue = k.holdCue ?? k.moveCue ?? segs.find((x) => x.from === step % move.keys.length)?.cue;
  }

  const joints = solve(pose, move.view);
  const nextStep = () => setStep((x) => (x + 1) % move.keys.length);

  return (
    <figure className={`${s.wrap} ${className ?? ''}`}>
      <div ref={box} className={s.box}>
        <Figure move={move} j={joints} className={s.svg} />
        {!still && <span className="sr-only">{label}</span>}
        {controls && !still && (
          <div className={s.controls}>
            <button type="button" className={s.ctrl} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar demo' : 'Reproducir demo'}>
              <Icon name={playing ? 'pause' : 'play'} />
            </button>
            {playing ? (
              <button type="button" className={`${s.ctrl} ${slow ? s.on : ''}`} onClick={() => setSlow((x) => !x)} aria-pressed={slow}>
                <span className={s.speed}>{slow ? '½×' : '1×'}</span>
                <span className="sr-only">Cámara lenta</span>
              </button>
            ) : (
              <button type="button" className={s.ctrl} onClick={nextStep} aria-label="Siguiente paso">
                <Icon name="next" />
              </button>
            )}
          </div>
        )}
      </div>
      {cues && !still && <figcaption className={s.cue}>{cue}</figcaption>}
    </figure>
  );
}
