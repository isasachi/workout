import type { Joints, Key, Limb, Pose, Vec } from './types';

export const L = {
  thigh: 44,
  shin: 42,
  ankle: 6,
  lowBack: 26,
  upBack: 27,
  neck: 9,
  head: 11,
  upperArm: 30,
  forearm: 28,
  hipHalf: 9,
  shoulderHalf: 17,
};

const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (a: number, len = 1): Vec => [Math.sin(rad(a)) * len, -Math.cos(rad(a)) * len];
const add = (p: Vec, q: Vec): Vec => [p[0] + q[0], p[1] + q[1]];
const sub = (p: Vec, q: Vec): Vec => [p[0] - q[0], p[1] - q[1]];

function solveLimb(root: Vec, limb: Limb, l1: number, l2: number, defaultHint: Vec): [Vec, Vec] {
  const k = limb.len ?? 1;
  if (limb.a) {
    const mid = add(root, dir(limb.a[0], l1 * k));
    return [mid, add(mid, dir(limb.a[1], l2 * k))];
  }
  const target = limb.ik ?? add(root, [0, -(l1 + l2)]);
  const d = sub(target, root);
  let dist = Math.hypot(d[0], d[1]);
  const max = l1 + l2 - 0.01;
  const min = Math.abs(l1 - l2) + 0.01;
  dist = Math.min(max, Math.max(min, dist));
  const base = Math.atan2(d[1], d[0]);
  const off = Math.acos((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist));
  const c1: Vec = add(root, [Math.cos(base + off) * l1, Math.sin(base + off) * l1]);
  const c2: Vec = add(root, [Math.cos(base - off) * l1, Math.sin(base - off) * l1]);
  const hint = limb.hint ?? defaultHint;
  const score = (p: Vec) => (p[0] - root[0]) * hint[0] + (p[1] - root[1]) * hint[1];
  const mid = score(c1) >= score(c2) ? c1 : c2;
  const u = sub(target, mid);
  const ul = Math.hypot(u[0], u[1]) || 1;
  return [mid, add(mid, [(u[0] / ul) * l2, (u[1] / ul) * l2])];
}

export function solve(pose: Pose, view: 'side' | 'front'): Joints {
  const pelvis = pose.hip;
  const mid = add(pelvis, dir(pose.spine[0], L.lowBack));
  const shoulder = add(mid, dir(pose.spine[1], L.upBack));
  const headA = pose.head ?? pose.spine[1];
  const headC = add(shoulder, dir(headA, L.neck + L.head));

  const front = view === 'front';
  // In front view "near" is the figure's left side, drawn on the viewer's right.
  const hipN: Vec = front ? add(pelvis, [L.hipHalf, 0]) : pelvis;
  const hipF: Vec = front ? add(pelvis, [-L.hipHalf, 0]) : pelvis;
  const shN: Vec = front ? add(shoulder, [L.shoulderHalf, -3]) : shoulder;
  const shF: Vec = front ? add(shoulder, [-L.shoulderHalf, -3]) : shoulder;

  const kneeHint: Vec = front ? [0, 1] : [1, 0];
  const [kneeN, ankleN] = solveLimb(hipN, pose.legN, L.thigh, L.shin, front ? [1, 0.2] : kneeHint);
  const [kneeF, ankleF] = solveLimb(hipF, pose.legF, L.thigh, L.shin, front ? [-1, 0.2] : kneeHint);
  const [elbowN, wristN] = solveLimb(shN, pose.armN, L.upperArm, L.forearm, front ? [1, 0] : [-1, 0]);
  const [elbowF, wristF] = solveLimb(shF, pose.armF, L.upperArm, L.forearm, front ? [-1, 0] : [-1, 0]);

  const foot = (ankle: Vec, a: number, side: 1 | -1): [Vec, Vec] => {
    if (front) {
      return [add(ankle, [-3 * side, -4]), add(ankle, [5 * side, -4])];
    }
    const down = dir(a - 90, 3);
    return [add(add(ankle, dir(a + 180, 5)), down), add(add(ankle, dir(a, 17)), down)];
  };
  const [heelN, toeN] = foot(ankleN, pose.legN.foot ?? 90, 1);
  const [heelF, toeF] = foot(ankleF, pose.legF.foot ?? 90, -1);

  return {
    pelvis, mid, shoulder, headC, hipN, hipF, kneeN, kneeF, ankleN, ankleF,
    heelN, heelF, toeN, toeF, shN, shF, elbowN, elbowF, wristN, wristF,
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpV = (a: Vec, b: Vec, t: number): Vec => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function lerpLimb(a: Limb, b: Limb, t: number): Limb {
  const out: Limb = {};
  if (a.a && b.a) out.a = [lerp(a.a[0], b.a[0], t), lerp(a.a[1], b.a[1], t)];
  else if (a.ik && b.ik) out.ik = lerpV(a.ik, b.ik, t);
  else Object.assign(out, t < 0.5 ? a : b);
  if (a.hint || b.hint) out.hint = lerpV(a.hint ?? b.hint!, b.hint ?? a.hint!, t);
  if (a.foot !== undefined || b.foot !== undefined) out.foot = lerp(a.foot ?? 90, b.foot ?? 90, t);
  if (a.len !== undefined || b.len !== undefined) out.len = lerp(a.len ?? 1, b.len ?? 1, t);
  return out;
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    hip: lerpV(a.hip, b.hip, t),
    spine: [lerp(a.spine[0], b.spine[0], t), lerp(a.spine[1], b.spine[1], t)],
    head: lerp(a.head ?? a.spine[1], b.head ?? b.spine[1], t),
    armN: lerpLimb(a.armN, b.armN, t),
    armF: lerpLimb(a.armF, b.armF, t),
    legN: lerpLimb(a.legN, b.legN, t),
    legF: lerpLimb(a.legF, b.legF, t),
  };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Segment = { from: number; to: number; dur: number; cue?: string; isHold: boolean };

/** Flattens keys into a timeline of hold and move segments. */
export function timeline(keys: Key[], pauseMs = 0): Segment[] {
  const segs: Segment[] = [];
  let cue = keys[0]?.holdCue ?? keys[0]?.moveCue;
  keys.forEach((k, i) => {
    const hold = (k.hold ?? 250) + (k.peak ? pauseMs : 0);
    if (k.holdCue) cue = k.holdCue;
    if (hold > 0) segs.push({ from: i, to: i, dur: hold, cue: k.peak && pauseMs ? 'Pausa: aguanta 2 s' : cue, isHold: true });
    if (k.moveCue) cue = k.moveCue;
    segs.push({ from: i, to: (i + 1) % keys.length, dur: k.move ?? 900, cue, isHold: false });
  });
  return segs;
}

export function sample(keys: Key[], segs: Segment[], tMs: number): { pose: Pose; cue?: string; seg: number } {
  const total = segs.reduce((s, x) => s + x.dur, 0);
  let t = ((tMs % total) + total) % total;
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (t <= s.dur) {
      const p = s.isHold ? keys[s.from].pose : lerpPose(keys[s.from].pose, keys[s.to].pose, ease(t / s.dur));
      return { pose: p, cue: s.cue, seg: i };
    }
    t -= s.dur;
  }
  return { pose: keys[0].pose, cue: segs[0]?.cue, seg: 0 };
}

export const cycleMs = (segs: Segment[]) => segs.reduce((s, x) => s + x.dur, 0);
