import { useEffect, useRef, type ReactNode } from 'react';
import { useNav } from '../nav';
import { Icon } from './Icon';
import s from './Overlay.module.css';

type Props = {
  title: string;
  /** Short line under the title in the bar, such as a step counter. */
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
  /** Scrolls the content back to the top whenever it changes (a new step). */
  scrollKey?: unknown;
};

/** Full-screen layer that slides over the tabs, like an iOS sheet. */
export function Overlay({ title, meta, children, footer, closeLabel = 'Cerrar', onClose, scrollKey }: Props) {
  const nav = useNav();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const close = onClose ?? nav.close;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    root.current?.focus();
    return () => prev?.focus?.();
  }, []);

  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [scrollKey]);

  return (
    <div ref={root} className={s.layer} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
      <header className={s.bar}>
        <button type="button" className={s.close} onClick={close} aria-label={closeLabel}>
          <Icon name="close" />
        </button>
        <div className={s.titles}>
          <p className={s.title}>{title}</p>
          {meta && <p className={s.meta}>{meta}</p>}
        </div>
        <span className={s.spacer} />
      </header>
      <div ref={body} className={s.body}>{children}</div>
      {footer && <footer className={s.footer}>{footer}</footer>}
    </div>
  );
}
