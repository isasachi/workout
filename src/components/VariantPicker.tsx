import type { Exercise } from '../data/exercises';
import { Icon } from './Icon';
import s from './VariantPicker.module.css';

type Props = {
  exercise: Exercise;
  value: number;
  current: number;
  onChange: (level: number) => void;
};

export function VariantPicker({ exercise, value, current, onChange }: Props) {
  const n = exercise.ladder.length;
  return (
    <div className={s.wrap}>
      <div className={s.row}>
        <button type="button" className={s.step} disabled={value === 0} onClick={() => onChange(value - 1)}>
          <Icon name="easier" size={20} />
          Más fácil
        </button>
        <div className={s.center}>
          <div className={s.track} aria-hidden="true">
            {exercise.ladder.map((v, i) => (
              <span key={v.id} className={`${s.seg} ${i <= value ? s.filled : ''} ${i === current ? s.mine : ''}`} />
            ))}
          </div>
          <p className={s.level}>
            Nivel {value + 1} de {n}
          </p>
        </div>
        <button type="button" className={s.step} disabled={value === n - 1} onClick={() => onChange(value + 1)}>
          Más difícil
          <Icon name="harder" size={20} />
        </button>
      </div>
      <p className={s.status} aria-live="polite">
        {value === current ? 'Es la variante que estás usando.' : value < current ? 'Variante más fácil que la tuya.' : 'Variante más difícil que la tuya.'}
      </p>
    </div>
  );
}
