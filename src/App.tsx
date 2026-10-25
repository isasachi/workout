import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavContext, type Nav, type Overlay, type Tab } from './nav';
import { Today } from './screens/Today';
import { TabBar } from './components/TabBar';
import { useSaveError } from './lib/store';
import s from './App.module.css';

const PlanScreen = lazy(() => import('./screens/Plan'));
const ProgressScreen = lazy(() => import('./screens/Progress'));
const ExerciseSheet = lazy(() => import('./screens/ExerciseSheet'));
const HistorySheet = lazy(() => import('./screens/HistorySheet'));
const DaySheet = lazy(() => import('./screens/DaySheet'));
const SessionRunner = lazy(() => import('./runners/SessionRunner'));

const TABS: Tab[] = ['hoy', 'plan', 'progreso'];
const tabFromHash = (): Tab => {
  const h = location.hash.slice(1) as Tab;
  return TABS.includes(h) ? h : 'hoy';
};

export function App() {
  const [tab, setTabState] = useState<Tab>(tabFromHash);
  const [stack, setStack] = useState<Overlay[]>([]);
  const saveError = useSaveError();
  const shell = useRef<HTMLDivElement>(null);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    history.replaceState(null, '', t === 'hoy' ? location.pathname : `#${t}`);
    window.scrollTo({ top: 0 });
  }, []);

  const nav: Nav = useMemo(
    () => ({
      open: (o) => setStack((st) => [...st, o]),
      close: () => setStack((st) => st.slice(0, -1)),
      setTab,
    }),
    [setTab],
  );

  // Background screens must not scroll under an open overlay.
  useEffect(() => {
    document.body.style.overflow = stack.length ? 'hidden' : '';
    shell.current?.toggleAttribute('inert', stack.length > 0);
  }, [stack.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && nav.close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nav]);

  return (
    <NavContext.Provider value={nav}>
      <div ref={shell} className={s.app}>
        {saveError && <p className={s.saveError}>No se pudo guardar en el teléfono. Revisa que haya espacio libre.</p>}
        <main className={s.main}>
          <Suspense fallback={<div className={s.fallback} />}>
            {tab === 'hoy' && <Today />}
            {tab === 'plan' && <PlanScreen />}
            {tab === 'progreso' && <ProgressScreen />}
          </Suspense>
        </main>
        <TabBar tab={tab} onChange={setTab} />
      </div>
      <Suspense fallback={null}>
        {stack.map((o, i) => {
          const key = `${i}-${o.type}`;
          switch (o.type) {
            case 'exercise':
              return <ExerciseSheet key={key} exercise={o.exercise} />;
            case 'history':
              return <HistorySheet key={key} exercise={o.exercise} />;
            case 'day':
              return <DaySheet key={key} date={o.date} />;
            case 'session':
              return <SessionRunner key={key} session={o.session} date={o.date} />;
          }
        })}
      </Suspense>
    </NavContext.Provider>
  );
}
