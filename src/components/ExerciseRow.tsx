import type { ReactNode } from 'react';
import { DemoPlayer } from '../demo/DemoPlayer';
import { Icon } from './Icon';
import s from './ExerciseRow.module.css';

type Props = {
  move: string;
  pause?: boolean;
  name: string;
  detail?: ReactNode;
  aside?: ReactNode;
  onClick?: () => void;
  /** Hide the chevron when the row sits beside its own action. */
  chevron?: boolean;
};

export function ExerciseRow({ move, pause, name, detail, aside, onClick, chevron = true }: Props) {
  const content = (
    <>
      <DemoPlayer moveId={move} pause={pause} still cues={false} controls={false} className={s.thumb} label={name} />
      <span className={s.text}>
        <span className={s.name}>{name}</span>
        {detail && <span className={s.detail}>{detail}</span>}
      </span>
      {aside}
      {onClick && chevron && <span className={s.chev}><Icon name="chevron" size={20} /></span>}
    </>
  );
  return onClick ? (
    <button type="button" className={s.row} onClick={onClick}>{content}</button>
  ) : (
    <div className={s.row}>{content}</div>
  );
}
