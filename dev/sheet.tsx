import { createRoot } from 'react-dom/client';
import { Figure } from '../src/demo/Figure';
import { lerpPose, solve } from '../src/demo/rig';
import { allMoveIds, loadMove } from '../src/demo/registry';
import type { Move } from '../src/demo/types';

const only = new URLSearchParams(location.search).get('only')?.split(',');
const ids = only ?? allMoveIds;
Promise.all(ids.map(loadMove)).then((moves: Move[]) => {
  createRoot(document.getElementById('root')!).render(
    <div>
      {moves.map((m) => {
        const frames = m.keys.flatMap((k, i) => {
          const next = m.keys[(i + 1) % m.keys.length].pose;
          return [k.pose, lerpPose(k.pose, next, 0.5)];
        });
        return (
          <div className="row" key={m.id}>
            <b>{m.id}</b>
            {frames.slice(0, 8).map((p, i) => <Figure key={i} move={m} j={solve(p, m.view)} />)}
          </div>
        );
      })}
      <i id="done" />
    </div>,
  );
});
