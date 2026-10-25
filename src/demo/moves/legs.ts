import type { Key, Move, Pose, Prop } from '../types';
import { stand, swapSides, tempo } from '../build';

// ---------- Squat family ----------

const squatTop = stand({ armN: { a: [4, 8] }, armF: { a: [-2, 4] } });
const squatBottom: Pose = {
  hip: [-27, 52],
  spine: [140, 145],
  head: 158,
  armN: { a: [96, 94] },
  armF: { a: [92, 90] },
  legN: { ik: [3, 6] },
  legF: { ik: [-3, 6] },
};

function squatKeys(f = 1): Key[] {
  return tempo(
    [
      { pose: squatTop, hold: 500, holdCue: 'Pies al ancho de hombros, puntas un poco abiertas', move: 2000, moveCue: 'Baja: cadera atrás y pecho alto' },
      { pose: squatBottom, hold: 300, holdCue: 'Muslos paralelos al suelo, o hasta donde puedas sin redondear la espalda', peak: true, move: 1200, moveCue: 'Sube empujando el suelo con todo el pie' },
    ],
    f,
  );
}

const squat = (id: string, props: Prop[] = [], f = 1): Move => ({ id, view: 'side', focus: ['legs'], props, keys: squatKeys(f) });

const chairBottom: Pose = { ...squatBottom, hip: [-25, 57], spine: [142, 147] };
const squatChair: Move = {
  id: 'squat-chair',
  view: 'side',
  focus: ['legs'],
  props: [{ kind: 'chair', x: -52 }],
  keys: [
    { pose: squatTop, hold: 500, holdCue: 'De espaldas a la silla, a un paso de ella', move: 2000, moveCue: 'Baja despacio llevando la cadera hacia la silla' },
    { pose: chairBottom, hold: 400, holdCue: 'Toca la silla sin dejarte caer', peak: true, move: 1200, moveCue: 'Sube empujando el suelo con los talones' },
  ],
};

const deepSquat: Pose = {
  hip: [-16, 30],
  spine: [150, 160],
  head: 165,
  armN: { ik: [26, 78], hint: [0, -1] },
  armF: { ik: [24, 78], hint: [0, -1] },
  legN: { ik: [6, 6] },
  legF: { ik: [-2, 6] },
};
const deepSquatHold: Move = {
  id: 'deep-squat-hold',
  view: 'side',
  focus: ['legs'],
  keys: [
    { pose: stand({ legN: { ik: [6, 6] }, legF: { ik: [-2, 6] } }), hold: 500, holdCue: 'Pies algo más abiertos que los hombros', move: 2200, moveCue: 'Baja todo lo que puedas con los talones en el suelo' },
    { pose: deepSquat, hold: 4000, holdCue: 'Aguanta 30 s: codos empujando las rodillas hacia fuera, respira', move: 1600, moveCue: 'Sube despacio' },
  ],
};

// Rear foot on a chair behind, front foot well ahead.
const bulgarianTop: Pose = {
  hip: [-6, 87],
  spine: [178, 178],
  armN: { a: [6, 10] },
  armF: { a: [-4, 2] },
  legN: { ik: [30, 6] },
  legF: { ik: [-60, 53], hint: [0, -1], foot: -100 },
};
const bulgarianBottom: Pose = { ...bulgarianTop, hip: [-12, 50], spine: [172, 174] };
const bulgarian: Move = {
  id: 'split-squat-bulgarian',
  view: 'side',
  focus: ['legs'],
  frame: [-120, -12, 220],
  props: [{ kind: 'chair', x: -102 }],
  keys: [
    { pose: bulgarianTop, hold: 500, holdCue: 'Empeine del pie de atrás sobre la silla', move: 2000, moveCue: 'Baja en vertical, la rodilla de atrás hacia el suelo' },
    { pose: bulgarianBottom, hold: 300, holdCue: 'Rodilla de delante sobre el tobillo', peak: true, move: 1300, moveCue: 'Sube empujando con el pie de delante' },
  ],
};

// ---------- Lunges ----------

const lungeBackN: Pose = {
  hip: [-8, 52],
  spine: [178, 178],
  armN: { a: [4, 8] },
  armF: { a: [-6, 0] },
  legN: { ik: [-62, 10], hint: [0, -1], foot: 40 },
  legF: { ik: [6, 6] },
};

function reverseLungeKeys(alternate: boolean, supportFar = false): Key[] {
  const start = stand();
  const down = supportFar ? { ...lungeBackN, armF: { ik: [16, 97] as [number, number], hint: [-1, -1] as [number, number] } } : lungeBackN;
  const s = supportFar ? { ...start, armF: { ik: [16, 97] as [number, number], hint: [-1, -1] as [number, number] } } : start;
  const keys: Key[] = [
    { pose: s, hold: 400, holdCue: 'De pie, pies al ancho de cadera', move: 1500, moveCue: 'Da un paso largo hacia atrás y baja' },
    { pose: down, hold: 300, holdCue: 'Rodilla de atrás cerca del suelo, tronco recto', peak: true, move: 1200, moveCue: 'Empuja con el pie de delante y vuelve' },
  ];
  if (!alternate) return keys;
  return [
    ...keys,
    { pose: s, hold: 400, holdCue: 'Ahora con la otra pierna', move: 1500, moveCue: 'Paso atrás con la otra pierna' },
    { pose: swapSides(down), hold: 300, holdCue: 'Rodilla de atrás cerca del suelo, tronco recto', peak: true, move: 1200, moveCue: 'Empuja con el pie de delante y vuelve' },
  ];
}

const lungeSupport: Move = {
  id: 'lunge-support',
  view: 'side',
  focus: ['legs'],
  props: [{ kind: 'chairBehind', x: 22 }],
  keys: reverseLungeKeys(false, true).map((k, i) => (i === 0 ? { ...k, holdCue: 'Una mano en el respaldo de una silla a tu lado' } : k)),
};

const lungeReverse = (id: string, props: Prop[] = []): Move => ({ id, view: 'side', focus: ['legs'], props, keys: reverseLungeKeys(true) });

const lungeFwdDown: Pose = {
  hip: [22, 52],
  spine: [178, 178],
  armN: { a: [4, 8] },
  armF: { a: [-6, 0] },
  legN: { ik: [60, 6] },
  legF: { ik: [-4, 10], hint: [0, -1], foot: 40 },
};
const lungeForward: Move = {
  id: 'lunge-forward',
  view: 'side',
  focus: ['legs'],
  frame: [-90, -12, 220],
  keys: [
    { pose: stand(), hold: 400, holdCue: 'De pie, pies al ancho de cadera', move: 1400, moveCue: 'Da un paso largo hacia delante y baja' },
    { pose: lungeFwdDown, hold: 300, holdCue: 'Rodilla de delante sobre el tobillo', peak: true, move: 1200, moveCue: 'Empuja con el pie de delante para volver' },
    { pose: stand(), hold: 400, holdCue: 'Cambia de pierna en cada repetición', move: 1400, moveCue: 'Paso adelante con la otra pierna' },
    { pose: swapSides(lungeFwdDown), hold: 300, peak: true, move: 1200, moveCue: 'Empuja con el pie de delante para volver' },
  ],
};

// ---------- Hinge ----------

const hingeDown: Pose = {
  hip: [-16, 88],
  spine: [128, 130],
  head: 118,
  armN: { a: [4, 4] },
  armF: { a: [0, 0] },
  legN: { ik: [3, 6] },
  legF: { ik: [-3, 6] },
};
const hinge: Move = {
  id: 'hinge',
  view: 'side',
  focus: ['legs', 'back'],
  keys: [
    { pose: stand(), hold: 400, holdCue: 'Rodillas un poco flexionadas, manos en los muslos', move: 1800, moveCue: 'Empuja la cadera hacia atrás, como si cerraras una puerta con el trasero' },
    { pose: hingeDown, hold: 300, holdCue: 'Espalda recta: para cuando notes tensión detrás del muslo', peak: true, move: 1200, moveCue: 'Sube llevando la cadera hacia delante' },
  ],
};

function rdl(id: string, mode: 'support' | 'free' | 'pack'): Move {
  const wallHand = { ik: [30, 102] as [number, number], hint: [0, -1] as [number, number] };
  const top = stand({
    legF: { a: [-10, -6] },
    armF: mode === 'support' ? wallHand : { a: [-4, 2] },
  });
  const down: Pose = {
    hip: [-6, 89],
    spine: [100, 100],
    head: 96,
    armN: { a: [0, 0] },
    armF: mode === 'support' ? wallHand : { a: [2, 2] },
    legN: { ik: [3, 6] },
    legF: { a: [-80, -80], foot: 0 },
  };
  const props: Prop[] = mode === 'support' ? [{ kind: 'wallBehind', x: 26 }] : mode === 'pack' ? [{ kind: 'backpackHands' }] : [];
  return {
    id,
    view: 'side',
    focus: ['legs', 'back'],
    frame: [-110, -12, 220],
    props,
    keys: [
      {
        pose: top,
        hold: 500,
        holdCue: mode === 'support' ? 'De lado a una pared, una mano apoyada' : mode === 'pack' ? 'Mochila en la mano, brazo colgando' : 'Mira un punto fijo en el suelo',
        move: 2000,
        moveCue: 'Cadera atrás; la pierna libre sube en línea con el tronco',
      },
      { pose: down, hold: 400, holdCue: 'Baja hasta notar tensión detrás del muslo, no hasta el suelo', peak: true, move: 1500, moveCue: 'Sube apretando el glúteo de la pierna de apoyo' },
    ],
  };
}

// ---------- Step-ups and stretch ----------

const stepProps: Prop[] = [{ kind: 'step', x: 22 }];
const stepUp: Move = {
  id: 'step-up',
  view: 'side',
  focus: ['legs'],
  props: stepProps,
  keys: [
    { pose: stand({ hip: [-2, 92], legN: { ik: [0, 6] }, legF: { ik: [-5, 6] } }), hold: 200, holdCue: 'Frente al escalón', move: 500, moveCue: 'Apoya el pie entero en el escalón' },
    { pose: stand({ hip: [2, 90], spine: [170, 172], legN: { ik: [42, 26] }, legF: { ik: [-5, 6] }, armN: { a: [-25, -10] }, armF: { a: [35, 70] } }), hold: 150, move: 700, moveCue: 'Sube empujando con esa pierna' },
    { pose: stand({ hip: [40, 112], spine: [176, 178], legN: { ik: [44, 26] }, legF: { ik: [36, 26] } }), hold: 250, holdCue: 'Arriba, de pie y estable', move: 600, moveCue: 'Baja primero la pierna que subió última' },
    { pose: stand({ hip: [6, 91], spine: [172, 174], legN: { ik: [42, 26] }, legF: { ik: [-5, 6] } }), hold: 100, move: 500, moveCue: 'Baja la otra y alterna la pierna que sube primero' },
  ],
};

const hipFlexor: Move = {
  id: 'hip-flexor',
  view: 'side',
  focus: ['legs'],
  frame: [-110, -12, 220],
  props: [{ kind: 'mat', x: 0 }],
  keys: [
    {
      pose: { hip: [-8, 46], spine: [180, 180], armN: { a: [4, 6] }, armF: { a: [-4, 0] }, legN: { a: [-28, -92], foot: -98 }, legF: { ik: [40, 6] } },
      hold: 800,
      holdCue: 'Rodilla de atrás en el suelo (pon una toalla debajo)',
      move: 1800,
      moveCue: 'Aprieta el glúteo de atrás y lleva la cadera hacia delante',
    },
    {
      pose: { hip: [4, 42], spine: [182, 182], armN: { a: [172, 176] }, armF: { a: [-4, 0] }, legN: { a: [-44, -92], foot: -98 }, legF: { ik: [40, 6] } },
      hold: 4000,
      holdCue: 'Aguanta 30 s: notas el estiramiento delante de la cadera de atrás',
      move: 1500,
      moveCue: 'Vuelve y luego cambia de lado',
    },
  ],
};

export const moves: Record<string, Move> = {
  squat: squat('squat'),
  'squat-fast': squat('squat-fast', [], 0.45),
  'squat-backpack': squat('squat-backpack', [{ kind: 'backpackBack' }]),
  'squat-chair': squatChair,
  'deep-squat-hold': deepSquatHold,
  'split-squat-bulgarian': bulgarian,
  'lunge-support': lungeSupport,
  'lunge-reverse': lungeReverse('lunge-reverse'),
  'lunge-backpack': lungeReverse('lunge-backpack', [{ kind: 'backpackBack' }]),
  'lunge-forward': lungeForward,
  hinge,
  'rdl-support': rdl('rdl-support', 'support'),
  'rdl-free': rdl('rdl-free', 'free'),
  'rdl-backpack': rdl('rdl-backpack', 'pack'),
  'step-up': stepUp,
  'hip-flexor': hipFlexor,
};
