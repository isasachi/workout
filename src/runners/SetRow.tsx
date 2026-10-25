import { useState } from 'react';
import { Icon } from '../components/Icon';
import { useStopwatch } from './common';
import s from './SetRow.module.css';

type Props = {
  index: number;
  metric: 'reps' | 'secs';
  value: number | null;
  suggested: number;
  range: [number, number];
  perSide?: boolean;
  onLog: (v: number | null) => void;
};

export function SetRow({ index, metric, value, suggested, range, perSide, onLog }: Props) {
  const [draft, setDraft] = useState(value ?? suggested);
  const watch = useStopwatch();
  const done = value !== null;
  const shown = done ? value : watch.running ? Math.floor(watch.elapsed / 1000) : draft;
  const stepBy = metric === 'secs' ? 5 : 1;
  const unit = metric === 'secs' ? 's' : perSide ? 'por lado' : 'reps';

  const adjust = (d: number) => {
    const n = Math.max(0, (done ? value! : draft) + d);
    setDraft(n);
    if (done) onLog(n);
  };

  const stopTimer = () => {
    const secs = Math.max(1, Math.round(watch.elapsed / 1000));
    watch.pause();
    watch.reset();
    setDraft(secs);
    onLog(secs);
  };

  return (
    <div className={`${s.row} ${done ? s.done : ''}`}>
      <span className={s.label}>Serie {index + 1}</span>
      <div className={s.value}>
        <button type="button" className={s.adj} onClick={() => adjust(-stepBy)} disabled={watch.running} aria-label="Menos">
          <Icon name="minus" />
        </button>
        <span className={s.num}>
          <span className="num">{shown}</span>
          <span className={s.unit}>{unit}</span>
        </span>
        <button type="button" className={s.adj} onClick={() => adjust(stepBy)} disabled={watch.running} aria-label="Más">
          <Icon name="plus" />
        </button>
      </div>
      {metric === 'secs' && !done ? (
        watch.running ? (
          <button type="button" className={`${s.check} ${s.stop}`} onClick={stopTimer} aria-label="Parar y anotar">
            <Icon name="pause" />
          </button>
        ) : (
          <button type="button" className={s.check} onClick={watch.start} aria-label={`Empezar a contar la serie ${index + 1}`}>
            <Icon name="timer" />
          </button>
        )
      ) : (
        <button
          type="button"
          className={s.check}
          aria-pressed={done}
          aria-label={done ? `Desmarcar serie ${index + 1}` : `Marcar serie ${index + 1} con ${draft}`}
          onClick={() => onLog(done ? null : draft)}
        >
          <Icon name="check" size={28} />
        </button>
      )}
      {metric === 'secs' && !done && !watch.running && (
        <button type="button" className={s.manual} onClick={() => onLog(draft)}>
          Anotar {draft} s sin cronómetro
        </button>
      )}
      {!done && index === 0 && metric === 'reps' && (
        <span className={s.range}>
          Objetivo {range[0]}–{range[1]}
        </span>
      )}
    </div>
  );
}
