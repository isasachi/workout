import type { Key, Limb, Pose, Vec } from './types';

/** Inverse of `dir`: the absolute angle of a vector. */
export const angleOf = (v: Vec) => (Math.atan2(v[0], -v[1]) * 180) / Math.PI;

const BODY = 131.6; // ankle to shoulder with a straight body
const KNEEL = 88; // knee to shoulder

/** Point S with |S-A| = la and |S-H| = lh, on the upper side of the A→H line. */
export function tri(A: Vec, H: Vec, la: number, lh: number): Vec {
  const dx = H[0] - A[0];
  const dy = H[1] - A[1];
  const d = Math.hypot(dx, dy);
  const a = (la * la - lh * lh + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, la * la - a * a));
  const mx = A[0] + (a * dx) / d;
  const my = A[1] + (a * dy) / d;
  const s1: Vec = [mx - (h * dy) / d, my + (h * dx) / d];
  const s2: Vec = [mx + (h * dy) / d, my - (h * dx) / d];
  return s1[1] >= s2[1] ? s1 : s2;
}

/** Straight body from the ankles to the shoulders (planks, push-ups, leaning moves). */
export function bodyLine(A: Vec, S: Vec) {
  const v: Vec = [S[0] - A[0], S[1] - A[1]];
  const len = Math.hypot(v[0], v[1]);
  const u: Vec = [v[0] / len, v[1] / len];
  const legLen = 85.6 * Math.min(1, len / BODY);
  const a = angleOf(u);
  return { hip: [A[0] + u[0] * legLen, A[1] + u[1] * legLen] as Vec, spine: [a, a] as [number, number], head: a };
}

/** Straight line from the knees to the shoulders (kneeling push-ups and planks). */
export function kneelLine(K: Vec, S: Vec) {
  const v: Vec = [S[0] - K[0], S[1] - K[1]];
  const len = Math.hypot(v[0], v[1]);
  const u: Vec = [v[0] / len, v[1] / len];
  const t = 42 * Math.min(1, len / KNEEL);
  const a = angleOf(u);
  return { hip: [K[0] + u[0] * t, K[1] + u[1] * t] as Vec, spine: [a, a] as [number, number], head: a, thigh: a - 180 };
}

export const shoulderOver = (A: Vec, H: Vec, arm: number) => tri(A, H, BODY, arm);
export const shoulderOverKnees = (K: Vec, H: Vec, arm: number) => tri(K, H, KNEEL, arm);

/** Angle from one point to another. */
export const toward = (from: Vec, to: Vec) => angleOf([to[0] - from[0], to[1] - from[1]]);

const ARMS_DOWN_N: Limb = { a: [3, 6] };
const ARMS_DOWN_F: Limb = { a: [-2, 3] };

export function stand(o: Partial<Pose> = {}): Pose {
  return {
    hip: [0, 92],
    spine: [180, 180],
    armN: ARMS_DOWN_N,
    armF: ARMS_DOWN_F,
    legN: { ik: [3, 6] },
    legF: { ik: [-3, 6] },
    ...o,
  };
}

/** Front view standing pose: near is the figure's left, drawn on the viewer's right. */
export function standFront(o: Partial<Pose> = {}): Pose {
  return {
    hip: [0, 91],
    spine: [180, 180],
    armN: { a: [8, 4] },
    armF: { a: [-8, -4] },
    legN: { ik: [10, 6] },
    legF: { ik: [-10, 6] },
    ...o,
  };
}

/** Swap near and far limbs, for alternating moves seen from the side. */
export function swapSides(p: Pose): Pose {
  return { ...p, armN: p.armF, armF: p.armN, legN: p.legF, legF: p.legN };
}

/** Speed a whole key list up or down. */
export function tempo(keys: Key[], f: number): Key[] {
  return keys.map((k) => ({ ...k, hold: Math.round((k.hold ?? 250) * f), move: Math.round((k.move ?? 900) * f) }));
}
