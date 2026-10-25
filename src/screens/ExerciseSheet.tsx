import { useState } from 'react';
import { DRILLS, EXERCISES } from '../data/exercises';
import { DemoPlayer } from '../demo/DemoPlayer';
import { Overlay } from '../components/Overlay';
import { VariantPicker } from '../components/VariantPicker';
import { levelOf } from '../lib/progress';
import { setLevel, useStore } from '../lib/store';
import s from './ExerciseSheet.module.css';

export function TechniqueNotes({ cues, mistakes }: { cues: string[]; mistakes: string[] }) {
  return (
    <div className={s.notes}>
      <section className={s.block}>
        <h2 className={s.h2}>Claves</h2>
        <ul className={s.cues}>
          {cues.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>
      {mistakes.length > 0 && (
        <section className={s.block}>
          <h2 className={s.h2}>Errores comunes</h2>
          <ul className={s.mistakes}>
            {mistakes.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

function DrillSheet({ id }: { id: string }) {
  const d = DRILLS[id];
  return (
    <Overlay title={d.name}>
      <div className={s.screen}>
        <DemoPlayer moveId={d.move} label={d.name} />
        <p className={s.lead}>{d.cue}</p>
      </div>
    </Overlay>
  );
}

function FamilySheet({ id }: { id: string }) {
  const ex = EXERCISES[id];
  const current = useStore((st) => levelOf(st, id));
  const [preview, setPreview] = useState(current);
  const v = ex.ladder[preview];

  return (
    <Overlay title={ex.name} meta={ex.works}>
      <div className={s.screen}>
        <DemoPlayer key={v.id} moveId={v.move} pause={v.pause} label={v.name} />
        <div className={s.titleRow}>
          <h1 className={s.h1}>{v.name}</h1>
          {v.needs && <p className={s.needs}>Necesitas: {v.needs.charAt(0).toLowerCase() + v.needs.slice(1)}</p>}
        </div>
        <VariantPicker exercise={ex} value={preview} current={current} onChange={setPreview} />
        {preview !== current && (
          <button type="button" className="btn btn-primary btn-block" onClick={() => setLevel(id, preview)}>
            Usar esta variante en mis sesiones
          </button>
        )}
        <TechniqueNotes cues={v.cues} mistakes={v.mistakes} />
      </div>
    </Overlay>
  );
}

export default function ExerciseSheet({ exercise }: { exercise: string }) {
  return EXERCISES[exercise] ? <FamilySheet id={exercise} /> : <DrillSheet id={exercise} />;
}
