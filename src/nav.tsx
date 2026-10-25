import { createContext, useContext } from 'react';
import type { SessionId } from './data/plan';

export type Overlay =
  | { type: 'exercise'; exercise: string }
  | { type: 'history'; exercise: string }
  | { type: 'day'; date: string }
  | { type: 'session'; session: SessionId; date: string };

export type Tab = 'hoy' | 'plan' | 'progreso';

export type Nav = {
  open: (o: Overlay) => void;
  close: () => void;
  setTab: (t: Tab) => void;
};

export const NavContext = createContext<Nav>({ open: () => {}, close: () => {}, setTab: () => {} });
export const useNav = () => useContext(NavContext);
