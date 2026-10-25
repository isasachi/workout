import type { Move } from './types';

type Group = 'legs' | 'push' | 'floor' | 'standing';

// Which code-split module holds each move.
const GROUP: Record<string, Group> = {
  squat: 'legs', 'squat-fast': 'legs', 'squat-backpack': 'legs', 'squat-chair': 'legs', 'deep-squat-hold': 'legs',
  'split-squat-bulgarian': 'legs', 'lunge-support': 'legs', 'lunge-reverse': 'legs', 'lunge-backpack': 'legs',
  'lunge-forward': 'legs', hinge: 'legs', 'rdl-support': 'legs', 'rdl-free': 'legs', 'rdl-backpack': 'legs',
  'step-up': 'legs', 'hip-flexor': 'legs',
  'pushup-wall': 'push', 'pushup-counter': 'push', 'pushup-chair': 'push', 'pushup-knees': 'push', pushup: 'push',
  'pike-chair': 'push', pike: 'push', 'plank-wall': 'push', 'plank-knees': 'push', plank: 'push',
  'plank-taps': 'push', climber: 'push',
  'bridge-short': 'floor', bridge: 'floor', 'bridge-single': 'floor', 'deadbug-legs': 'floor', deadbug: 'floor',
  birddog: 'floor', 'cat-cow': 'floor', thoracic: 'floor', superman: 'floor', ytw: 'floor',
  march: 'standing', 'high-knees': 'standing', walk: 'standing', 'jack-step': 'standing', skater: 'standing',
  'hip-circles': 'standing', 'wall-angels': 'standing', 'shadow-box': 'standing', 'row-towel-far': 'standing',
  'row-towel-near': 'standing',
};

const loaders: Record<Group, () => Promise<{ moves: Record<string, Move> }>> = {
  legs: () => import('./moves/legs'),
  push: () => import('./moves/push'),
  floor: () => import('./moves/floor'),
  standing: () => import('./moves/standing'),
};

const cache = new Map<string, Move>();

export function cachedMove(id: string): Move | undefined {
  return cache.get(id);
}

export async function loadMove(id: string): Promise<Move> {
  const hit = cache.get(id);
  if (hit) return hit;
  const group = GROUP[id];
  if (!group) throw new Error(`Movimiento desconocido: ${id}`);
  const mod = await loaders[group]();
  for (const [k, m] of Object.entries(mod.moves)) cache.set(k, m);
  const m = cache.get(id);
  if (!m) throw new Error(`Movimiento desconocido: ${id}`);
  return m;
}

export const allMoveIds = Object.keys(GROUP);
