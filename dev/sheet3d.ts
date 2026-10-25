import { FigureScene } from '../src/demo/three/FigureScene';
import { lerpPose, solve } from '../src/demo/rig';
import { allMoveIds, loadMove } from '../src/demo/registry';

const only = new URLSearchParams(location.search).get('only')?.split(',');
const ids = only ?? allMoveIds;
const W = 400, H = 356;
const scene = new FigureScene(undefined, { preserve: true });
scene.setSize(W, H, 1);
const root = document.getElementById('root')!;
(async () => {
  for (const id of ids) {
    const m = await loadMove(id);
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<b>${id}</b>`;
    root.appendChild(row);
    scene.setMove(m);
    const frames = m.keys.flatMap((k, i) => [k.pose, lerpPose(k.pose, m.keys[(i + 1) % m.keys.length].pose, 0.5)]).slice(0, 6);
    for (const p of frames) {
      scene.setPose(solve(p, m.view));
      scene.render();
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      c.getContext('2d')!.drawImage(scene.renderer.domElement, 0, 0);
      row.appendChild(c);
    }
  }
  const done = document.createElement('i');
  done.id = 'done';
  root.appendChild(done);
})();
