import { FigureScene, ready } from './FigureScene';
import { solve } from '../rig';
import type { Move } from '../types';

// One shared WebGL context renders every list thumbnail; browsers cap live contexts.
let scene: FigureScene | null = null;
const cache = new Map<string, string>();
let queue = ready;

const W = 240;
const H = Math.round(240 / (220 / 196));

export function thumbFor(move: Move): Promise<string> {
  const hit = cache.get(move.id);
  if (hit) return Promise.resolve(hit);
  const job = queue.then(
    () =>
      new Promise<string>((resolve, reject) => {
        try {
          scene ??= new FigureScene(document.createElement('canvas'), { preserve: true });
          scene.setSize(W, H, 2);
          scene.setMove(move, { tight: true });
          const peak = move.keys.find((k) => k.peak) ?? move.keys[Math.min(1, move.keys.length - 1)];
          scene.setPose(solve(peak.pose, move.view));
          scene.render();
          scene.renderer.domElement.toBlob((b) => {
            if (!b) return reject(new Error('thumb'));
            const url = URL.createObjectURL(b);
            cache.set(move.id, url);
            resolve(url);
          }, 'image/webp', 0.86);
        } catch (e) {
          reject(e);
        }
      }),
  );
  queue = job.then(() => undefined, () => undefined);
  return job;
}
