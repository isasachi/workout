import type { Tab } from '../nav';
import { Icon } from './Icon';
import s from './TabBar.module.css';

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hoy', label: 'Hoy', icon: 'today' },
  { id: 'plan', label: 'Plan', icon: 'plan' },
  { id: 'progreso', label: 'Progreso', icon: 'progress' },
];

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className={s.bar} aria-label="Secciones">
      {ITEMS.map((it) => (
        <button key={it.id} type="button" className={s.item} aria-current={tab === it.id ? 'page' : undefined} onClick={() => onChange(it.id)}>
          <Icon name={it.icon} size={26} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
