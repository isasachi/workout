export type SessionKind = 'strength' | 'cardio' | 'recovery' | 'hiit' | 'rest';
export type SessionId = 'A' | 'B' | 'cardio' | 'recovery' | 'hiit' | 'rest';

export type Slot = {
  exercise: string;
  baseSets: number;
  reps: [number, number];
  defaultLevel: number;
  note?: string;
};

export type Phase = {
  name: string;
  weeks: [number, number];
  rir: string;
  focus: string;
};

export const PHASES: Phase[] = [
  { name: 'Adaptación', weeks: [1, 2], rir: '3', focus: 'Aprende la técnica; 2 series por ejercicio' },
  { name: 'Progresión', weeks: [3, 5], rir: '2', focus: '3 series y +5 min de cardio cada semana' },
  { name: 'Intensificación', weeks: [6, 7], rir: '1–2', focus: 'Sube de variante donde toque' },
  { name: 'Descarga', weeks: [8, 8], rir: '3–4', focus: 'Menos volumen para llegar fresco al siguiente ciclo' },
];

export const phaseOf = (week: number) => PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) ?? PHASES[0];

export function setsFor(slot: Slot, week: number): number {
  const p = phaseOf(week).name;
  if (p === 'Adaptación' || p === 'Descarga') return Math.min(2, slot.baseSets);
  return slot.baseSets;
}

const CARDIO_MIN = [30, 30, 35, 40, 45, 45, 45, 30];
export const cardioMinutes = (week: number) => CARDIO_MIN[week - 1] ?? 30;

export type Hiit = { blocks: number; hard: number; easy: number; warm: number; cool: number };
export function hiitFor(week: number): Hiit {
  if (week <= 2) return { blocks: 4, hard: 2, easy: 2, warm: 8, cool: 5 };
  if (week <= 5) return { blocks: 4, hard: 3, easy: 3, warm: 8, cool: 5 };
  if (week <= 7) return { blocks: 4, hard: 4, easy: 3, warm: 8, cool: 5 };
  return { blocks: 2, hard: 4, easy: 3, warm: 8, cool: 5 };
}
export const hiitTotal = (h: Hiit) => h.warm + h.blocks * h.hard + (h.blocks - 1) * h.easy + h.cool;

export const STRENGTH: Record<'A' | 'B', Slot[]> = {
  A: [
    { exercise: 'squat', baseSets: 3, reps: [10, 15], defaultLevel: 1 },
    { exercise: 'push', baseSets: 3, reps: [8, 12], defaultLevel: 1 },
    { exercise: 'row', baseSets: 3, reps: [10, 12], defaultLevel: 1 },
    { exercise: 'bridge', baseSets: 3, reps: [12, 15], defaultLevel: 1 },
    { exercise: 'pike', baseSets: 2, reps: [6, 10], defaultLevel: 1 },
    { exercise: 'plank', baseSets: 3, reps: [20, 40], defaultLevel: 1 },
  ],
  B: [
    { exercise: 'rdl', baseSets: 3, reps: [8, 10], defaultLevel: 1 },
    { exercise: 'lunge', baseSets: 3, reps: [8, 10], defaultLevel: 1 },
    { exercise: 'row', baseSets: 3, reps: [10, 12], defaultLevel: 1 },
    { exercise: 'push', baseSets: 3, reps: [6, 10], defaultLevel: 1, note: 'Con pausa de 2 s abajo' },
    { exercise: 'back', baseSets: 3, reps: [10, 12], defaultLevel: 1 },
    { exercise: 'deadbug', baseSets: 3, reps: [8, 8], defaultLevel: 1 },
  ],
};

export type DrillItem = { drill: string; dose: string };

export const WARMUP: { items: DrillItem[]; last: string } = {
  items: [
    { drill: 'march', dose: '2½ min' },
    { drill: 'jack-step', dose: '2½ min' },
    { drill: 'hip-circles', dose: '10 por\u00a0lado' },
    { drill: 'cat-cow', dose: '10' },
    { drill: 'thoracic', dose: '10 por\u00a0lado' },
    { drill: 'bridge', dose: '10' },
    { drill: 'wall-angels', dose: '10' },
  ],
  last: 'Termina con una serie suave del primer ejercicio, en su variante más fácil: 8 repeticiones.',
};

export type CardioOption = { id: string; name: string; short: string; detail: string; drills: string[]; rotateMin?: number };
export const CARDIO_OPTIONS: CardioOption[] = [
  { id: 'walk', name: 'Caminata rápida', short: 'Caminata', detail: 'La mejor opción. Al aire libre y con cuestas si las tienes cerca.', drills: ['walk'] },
  { id: 'stairs', name: 'Escaleras', short: 'Escaleras', detail: 'Sube y baja a ritmo constante.', drills: ['step-up'] },
  { id: 'circuit', name: 'Circuito en casa', short: 'Circuito', detail: '3 min por ejercicio, sin parar, y vuelta a empezar.', drills: ['march', 'step-up', 'shadow-box', 'jack-step'], rotateMin: 3 },
];

export const HIIT_HOME = ['high-knees', 'squat-fast', 'skater', 'climber'];

export const RECOVERY: { walk: string; items: DrillItem[] } = {
  walk: '20–30 min de caminata a ritmo cómodo (RPE 2–3), mejor al aire libre o después de comer.',
  items: [
    { drill: 'deep-squat-hold', dose: '2 × 30\u00a0s' },
    { drill: 'hip-flexor', dose: '2 × 30\u00a0s por\u00a0lado' },
    { drill: 'thoracic', dose: '10 por\u00a0lado' },
  ],
};

// JS getDay(): 0 = domingo.
export const SCHEDULE: SessionId[] = ['rest', 'A', 'cardio', 'recovery', 'B', 'cardio', 'hiit'];
export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
/** Monday-first order of JS weekdays. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export type SessionInfo = { id: SessionId; kind: SessionKind; title: string; subtitle: string; duration: string; intensity: string };

export function sessionInfo(id: SessionId, week: number): SessionInfo {
  const ph = phaseOf(week);
  switch (id) {
    case 'A':
      return { id, kind: 'strength', title: 'Fuerza A', subtitle: 'Cuerpo completo: sentadilla y empuje', duration: '35–45 min', intensity: `RIR ${ph.rir}` };
    case 'B':
      return { id, kind: 'strength', title: 'Fuerza B', subtitle: 'Cuerpo completo: bisagra y tirón', duration: '35–45 min', intensity: `RIR ${ph.rir}` };
    case 'cardio':
      return { id, kind: 'cardio', title: 'Cardio moderado', subtitle: 'Ritmo en el que aún puedes conversar', duration: `${cardioMinutes(week)} min`, intensity: 'RPE 4–5' };
    case 'recovery':
      return { id, kind: 'recovery', title: 'Recuperación activa', subtitle: 'Caminata suave y movilidad. Opcional', duration: '20–30 min', intensity: 'Muy suave' };
    case 'hiit': {
      const h = hiitFor(week);
      return { id, kind: 'hiit', title: 'HIIT por intervalos', subtitle: `${h.blocks} bloques de ${h.hard} min fuertes`, duration: `${hiitTotal(h)} min`, intensity: 'RPE 8 en los bloques' };
    }
    default:
      return { id: 'rest', kind: 'rest', title: 'Descanso', subtitle: 'El músculo se construye descansando', duration: '—', intensity: '—' };
  }
}

export const KIND_COLOR: Record<SessionKind, string> = {
  strength: 'var(--c-strength)',
  cardio: 'var(--c-cardio)',
  recovery: 'var(--c-recovery)',
  hiit: 'var(--c-hiit)',
  rest: 'var(--c-rest)',
};
