import type { FocusGroup, Joints, Move, Prop, Vec } from './types';

import { DEFAULT_FRAME, DEMO_ASPECT } from './frame';

export { DEMO_ASPECT };

const P = (v: Vec) => `${v[0].toFixed(1)},${(-v[1]).toFixed(1)}`;

function line(a: Vec, b: Vec, w: number, color: string, key?: string) {
  return (
    <line key={key} x1={a[0]} y1={-a[1]} x2={b[0]} y2={-b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
}

function PropShape({ prop, j }: { prop: Prop; j: Joints }) {
  const x = prop.x ?? 0;
  const s = prop.flip ? -1 : 1;
  switch (prop.kind) {
    case 'chair':
    case 'chairBehind': {
      const c = prop.kind === 'chair' ? 'var(--demo-prop)' : 'var(--demo-prop-far)';
      // Backrest at x, seat runs 40 units toward +x (or -x when flipped).
      return (
        <g stroke={c} strokeWidth={5} strokeLinecap="round" fill="none">
          <line x1={x} y1={0} x2={x} y2={-96} />
          <line x1={x} y1={-46} x2={x + 40 * s} y2={-46} strokeWidth={7} />
          <line x1={x + 38 * s} y1={-46} x2={x + 38 * s} y2={0} />
        </g>
      );
    }
    case 'wallFront':
      return <rect x={x} y={-200} width={14} height={200} fill="var(--demo-prop)" />;
    case 'wallBehind':
      return <rect x={x - 70} y={-170} width={140} height={170} rx={4} fill="var(--demo-wall)" />;
    case 'counter':
      return (
        <g fill="var(--demo-prop)">
          <rect x={x} y={-92} width={70} height={7} rx={2} />
          <rect x={x + 58} y={-86} width={7} height={86} />
        </g>
      );
    case 'step':
      return <rect x={x} y={-20} width={56} height={20} rx={3} fill="var(--demo-prop)" />;
    case 'door': {
      const knob: Vec = [x - 4, 95];
      return (
        <g>
          <rect x={x} y={-200} width={10} height={200} fill="var(--demo-prop)" />
          {line(knob, j.wristF, 4, 'var(--demo-towel-far)', 'tf')}
          {line(knob, j.wristN, 4, 'var(--demo-towel)', 'tn')}
          <circle cx={knob[0]} cy={-knob[1]} r={4} fill="var(--demo-prop-line)" />
        </g>
      );
    }
    case 'backpackHands':
      return <rect x={j.wristN[0] - 9} y={-j.wristN[1] + 2} width={18} height={24} rx={5} fill="var(--demo-pack)" />;
    case 'backpackBack': {
      const u: Vec = [j.shoulder[0] - j.mid[0], j.shoulder[1] - j.mid[1]];
      const ul = Math.hypot(u[0], u[1]) || 1;
      const n: Vec = [-u[1] / ul, u[0] / ul];
      const c: Vec = [j.mid[0] + (u[0] / ul) * 13 + n[0] * 12, j.mid[1] + (u[1] / ul) * 13 + n[1] * 12];
      const ang = (Math.atan2(u[0], u[1]) * 180) / Math.PI;
      return (
        <rect x={-8} y={-13} width={16} height={26} rx={5} fill="var(--demo-pack)"
          transform={`translate(${c[0]} ${-c[1]}) rotate(${ang})`} />
      );
    }
    case 'mat':
      return <rect x={x - 100} y={-3} width={200} height={3} rx={1.5} fill="var(--demo-mat)" />;
  }
}

// Everything sits behind the figure except what the hands carry.
const FRONT_PROPS = new Set(['backpackHands']);

export function Figure({ move, j, className }: { move: Move; j: Joints; className?: string }) {
  const [fx, fy, fw] = move.frame ?? DEFAULT_FRAME;
  const fh = fw / DEMO_ASPECT;
  const focus = new Set<FocusGroup>(move.focus ?? []);
  const front = move.view === 'front';
  const near = (g: FocusGroup) => (focus.has(g) ? 'var(--demo-focus)' : 'var(--demo-fig)');
  // In front view both sides face the camera, so neither is dimmed.
  const far = (g: FocusGroup) =>
    front ? near(g) : focus.has(g) ? 'var(--demo-focus-far)' : 'var(--demo-fig-far)';
  const torso = focus.has('core') || focus.has('back') ? 'var(--demo-focus)' : 'var(--demo-fig)';
  const ctrl: Vec = [2 * j.mid[0] - (j.pelvis[0] + j.shoulder[0]) / 2, 2 * j.mid[1] - (j.pelvis[1] + j.shoulder[1]) / 2];
  const props = move.props ?? [];

  return (
    <svg className={className} viewBox={`${fx} ${-(fy + fh)} ${fw} ${fh}`} role="img" aria-hidden="true">
      <rect x={fx - 10} y={0} width={fw + 20} height={fh} fill="var(--demo-floor)" />
      {props.filter((p) => !FRONT_PROPS.has(p.kind)).map((p, i) => <PropShape key={'b' + i} prop={p} j={j} />)}
      {/* far side (in front view the arms go over the body instead) */}
      {line(j.hipF, j.kneeF, 13, far('legs'))}
      {line(j.kneeF, j.ankleF, 11, far('legs'))}
      {line(j.heelF, j.toeF, 7, far('legs'))}
      {!front && line(j.shF, j.elbowF, 10, far('arms'))}
      {!front && line(j.elbowF, j.wristF, 9, far('arms'))}
      {/* body */}
      <path d={`M${P(j.pelvis)} Q${P(ctrl)} ${P(j.shoulder)}`} stroke={torso} strokeWidth={front ? 22 : 17}
        strokeLinecap="round" fill="none" />
      {front && line(j.hipF, j.hipN, 14, torso)}
      {line(j.shoulder, j.headC, 8, 'var(--demo-fig)')}
      <circle cx={j.headC[0]} cy={-j.headC[1]} r={11} fill="var(--demo-fig)" />
      {/* near side */}
      {line(j.hipN, j.kneeN, 13, near('legs'))}
      {line(j.kneeN, j.ankleN, 11, near('legs'))}
      {line(j.heelN, j.toeN, 7, near('legs'))}
      {front && line(j.shN, j.elbowN, 14, 'var(--demo-bg)')}
      {front && line(j.elbowN, j.wristN, 13, 'var(--demo-bg)')}
      {front && line(j.shF, j.elbowF, 14, 'var(--demo-bg)')}
      {front && line(j.elbowF, j.wristF, 13, 'var(--demo-bg)')}
      {line(j.shN, j.elbowN, 10, near('arms'))}
      {line(j.elbowN, j.wristN, 9, near('arms'))}
      {front && line(j.shF, j.elbowF, 10, far('arms'))}
      {front && line(j.elbowF, j.wristF, 9, far('arms'))}
      {props.filter((p) => FRONT_PROPS.has(p.kind)).map((p, i) => <PropShape key={'f' + i} prop={p} j={j} />)}
    </svg>
  );
}
