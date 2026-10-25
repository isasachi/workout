import { lazy, Suspense } from 'react';
import type { SessionId } from '../data/plan';
import { useWakeLock } from './common';

const StrengthRunner = lazy(() => import('./StrengthRunner'));
const CardioRunner = lazy(() => import('./CardioRunner'));
const HiitRunner = lazy(() => import('./HiitRunner'));
const RecoveryRunner = lazy(() => import('./RecoveryRunner'));

export default function SessionRunner({ session, date }: { session: SessionId; date: string }) {
  useWakeLock();
  return (
    <Suspense fallback={null}>
      {(session === 'A' || session === 'B') && <StrengthRunner session={session} date={date} />}
      {session === 'cardio' && <CardioRunner date={date} />}
      {session === 'hiit' && <HiitRunner date={date} />}
      {session === 'recovery' && <RecoveryRunner date={date} />}
    </Suspense>
  );
}
