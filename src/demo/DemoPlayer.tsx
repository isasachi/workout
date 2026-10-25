import { useEffect, useMemo, useRef, useState } from 'react';
import { Figure } from './Figure';
import { cachedMove, loadMove } from './registry';
import { sample, solve, timeline, type Segment } from './rig';
import type { Move, Pose } from './types';
import { Icon } from '../components/Icon';
import s from './DemoPlayer.module.css';

type SceneModule = typeof import('./three/FigureScene');
type ThumbModule = typeof import('./three/thumbs');

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

let sceneModule: Promise<SceneModule> | null = null;
const loadScene = () => (sceneModule ??= import('./three/FigureScene'));
let thumbModule: Promise<ThumbModule> | null = null;
const loadThumbs = () => (thumbModule ??= import('./three/thumbs'));

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

/** The distinct cues of a move, in the order the rep reaches them. */
function stepsOf(segs: Segment[]) {
  const out: string[] = [];
  for (const sg of segs) if (sg.cue && !out.includes(sg.cue)) out.push(sg.cue);
  return out;
}

const peakPose = (m: Move): Pose => (m.keys.find((k) => k.peak) ?? m.keys[Math.min(1, m.keys.length - 1)]).pose;

type Props = {
  moveId: string;
  pause?: boolean;
  /** Show the step list under the stage. */
  cues?: boolean;
  controls?: boolean;
  /** Static frame at the hardest point, for lists. */
  still?: boolean;
  className?: string;
  label: string;
};

function Thumb({ move }: { move: Move }) {
  const [url, setUrl] = useState<string | null>(null);
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    let alive = true;
    loadThumbs()
      .then((t) => t.thumbFor(move))
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setFlat(true));
    return () => {
      alive = false;
    };
  }, [move]);
  if (url && !flat) return <img className={s.img} src={url} alt="" draggable={false} />;
  return <Figure move={move} j={solve(peakPose(move), move.view)} className={`${s.svg} ${flat ? '' : s.placeholder}`} />;
}

export function DemoPlayer({ moveId, pause = false, cues = true, controls = true, still = false, className, label }: Props) {
  const { move, failed } = useMove(moveId);
  const segs = useMemo(() => (move ? timeline(move.keys, pause ? 2000 : 0) : []), [move, pause]);
  const steps = useMemo(() => stepsOf(segs), [segs]);
  const [playing, setPlaying] = useState(() => !still && !reducedMotion());
  const [slow, setSlow] = useState(false);
  const [step, setStep] = useState(0);
  const [activeCue, setActiveCue] = useState<string | undefined>(undefined);
  const [flat, setFlat] = useState(false);
  const [flatPose, setFlatPose] = useState<Pose | null>(null);

  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<InstanceType<SceneModule['FigureScene']> | null>(null);
  const visible = useRef(true);
  const t = useRef(0);

  // Create the 3D stage once per player; fall back to the flat figure without WebGL.
  useEffect(() => {
    if (still || !move) return;
    let alive = true;
    let ro: ResizeObserver | undefined;
    loadScene()
      .then(({ FigureScene }) => {
        if (!alive || !canvas.current || !box.current) return;
        const sc = new FigureScene(canvas.current);
        scene.current = sc;
        const fit = () => {
          if (!box.current || scene.current !== sc) return;
          const r = box.current.getBoundingClientRect();
          sc.setSize(Math.max(1, r.width), Math.max(1, r.height), window.devicePixelRatio || 1);
          sc.render();
        };
        sc.setMove(move);
        sc.setPose(solve(move.keys[0].pose, move.view));
        fit();
        ro = new ResizeObserver(fit);
        ro.observe(box.current);
      })
      .catch(() => alive && setFlat(true));
    return () => {
      alive = false;
      ro?.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [move, still]);

  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(box.current);
    return () => io.disconnect();
  }, [move]);

  // Drive the stage outside React: only the active cue goes through state.
  useEffect(() => {
    if (!move || still) return;
    const draw = (pose: Pose) => {
      if (scene.current) {
        scene.current.setPose(solve(pose, move.view));
        scene.current.render();
      } else if (flat) setFlatPose(pose);
    };
    if (!playing) {
      const k = move.keys[step % move.keys.length];
      draw(k.pose);
      setActiveCue(k.holdCue ?? k.moveCue ?? segs.find((x) => x.from === step % move.keys.length)?.cue);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (visible.current && !document.hidden) {
        t.current += dt * (slow ? 0.5 : 1);
        const r = sample(move.keys, segs, t.current);
        draw(r.pose);
        setActiveCue((c) => (c === r.cue ? c : r.cue));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, slow, move, segs, step, still, flat]);

  if (failed) return <div className={`${s.box} ${className ?? ''}`}><p className={s.error}>No se pudo cargar la demo.</p></div>;
  if (!move) return <div className={`${s.box} ${s.loading} ${className ?? ''}`} aria-hidden="true" />;

  if (still) {
    return (
      <figure className={`${s.wrap} ${className ?? ''}`}>
        <div className={s.box}>
          <Thumb move={move} />
        </div>
      </figure>
    );
  }

  const active = steps.indexOf(activeCue ?? '');

  return (
    <figure className={`${s.wrap} ${className ?? ''}`}>
      <div ref={box} className={s.box}>
        {flat ? (
          <Figure move={move} j={solve(flatPose ?? move.keys[0].pose, move.view)} className={s.svg} />
        ) : (
          <canvas ref={canvas} className={s.canvas} aria-hidden="true" />
        )}
        <span className="sr-only">{label}</span>
        {controls && (
          <div className={s.controls}>
            <button type="button" className={s.ctrl} onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar demo' : 'Reproducir demo'}>
              <Icon name={playing ? 'pause' : 'play'} size={20} />
            </button>
            {playing ? (
              <button type="button" className={`${s.ctrl} ${slow ? s.on : ''}`} onClick={() => setSlow((x) => !x)} aria-pressed={slow}>
                <span className={s.speed}>{slow ? '½×' : '1×'}</span>
                <span className="sr-only">Cámara lenta</span>
              </button>
            ) : (
              <button type="button" className={s.ctrl} onClick={() => setStep((x) => (x + 1) % move.keys.length)} aria-label="Siguiente paso">
                <Icon name="next" size={20} />
              </button>
            )}
          </div>
        )}
      </div>
      {cues && steps.length > 0 && (
        <figcaption>
          <ol className={s.steps}>
            {steps.map((c, i) => (
              <li key={c} className={i === active ? s.now : undefined} aria-current={i === active ? 'step' : undefined}>
                {c}
              </li>
            ))}
          </ol>
        </figcaption>
      )}
    </figure>
  );
}
