import type { Limb, Move, Pose, Vec } from '../types';
import { swapSides } from '../build';

// ---------- Glute bridge: lying on the back, head to the left ----------

const bridgeArms = { armN: { a: [92, 90] } as Limb, armF: { a: [92, 90] } as Limb };
const bridgeDown = (feet: Vec, single = false): Pose => ({
  hip: [2, 10],
  spine: [-90, -90],
  head: -92,
  ...bridgeArms,
  legN: { ik: feet, hint: [0.3, 1] },
  legF: single ? { a: [122, 122], foot: 200 } : { ik: [feet[0] - 3, feet[1]], hint: [0.3, 1] },
});
const bridgeUp = (lift: number, feet: Vec, single = false): Pose => {
  const hip: Vec = [4, 10 + lift];
  const sh: Vec = [-46, 10];
  const a = (Math.atan2(sh[0] - hip[0], -(sh[1] - hip[1])) * 180) / Math.PI;
  return {
    hip,
    spine: [a, a],
    head: -93,
    ...bridgeArms,
    legN: { ik: feet, hint: [0.3, 1] },
    legF: single ? { a: [112, 112], foot: 200 } : { ik: [feet[0] - 3, feet[1]], hint: [0.3, 1] },
  };
};

function bridge(id: string, lift: number, single = false): Move {
  const feet: Vec = [36, 6];
  return {
    id,
    view: 'side',
    focus: ['legs'],
    frame: [-100, -10, 192],
    props: [{ kind: 'mat', x: -20 }],
    keys: [
      {
        pose: bridgeDown(feet, single),
        hold: 500,
        holdCue: single ? 'Un pie apoyado, la otra pierna estirada' : 'Boca arriba, pies apoyados cerca de los glúteos',
        move: 1300,
        moveCue: 'Empuja con los talones y sube la cadera',
      },
      {
        pose: bridgeUp(lift, feet, single),
        hold: 500,
        holdCue: lift < 25 ? 'Sube solo un poco y aprieta glúteos' : 'Hombros, cadera y rodillas en línea',
        peak: true,
        move: 1500,
        moveCue: 'Baja despacio',
      },
    ],
  };
}

// ---------- Dead bug: lying on the back, head to the left ----------

const tabletop = (): Pose => ({
  hip: [0, 10],
  spine: [-90, -90],
  head: -92,
  armN: { a: [178, 178] },
  armF: { a: [176, 176] },
  legN: { ik: [42, 54], hint: [0, 1], foot: 175 },
  legF: { ik: [39, 54], hint: [0, 1], foot: 175 },
});

function deadbug(id: string, armsToo: boolean): Move {
  const t = tabletop();
  const lowN: Pose = armsToo
    ? { ...t, legN: { ik: [84, 16], hint: [0, 1], foot: 150 }, armF: { a: [266, 265] } }
    : { ...t, legN: { ik: [58, 8], hint: [0, 1], foot: 150 } };
  const lowF: Pose = armsToo
    ? { ...t, legF: { ik: [81, 16], hint: [0, 1], foot: 150 }, armN: { a: [264, 263] } }
    : { ...t, legF: { ik: [55, 8], hint: [0, 1], foot: 150 } };
  return {
    id,
    view: 'side',
    focus: ['core'],
    frame: [-104, -10, 200],
    props: [{ kind: 'mat', x: -10 }],
    keys: [
      { pose: t, hold: 500, holdCue: 'Brazos al techo, rodillas sobre la cadera', move: 1600, moveCue: armsToo ? 'Estira una pierna y el brazo contrario' : 'Baja un pie hasta rozar el suelo' },
      { pose: lowN, hold: 300, holdCue: 'La zona lumbar sigue pegada al suelo', peak: true, move: 1300, moveCue: 'Vuelve al centro' },
      { pose: t, hold: 300, move: 1600, moveCue: 'Ahora el otro lado' },
      { pose: lowF, hold: 300, holdCue: 'Respira hacia fuera al estirar', peak: true, move: 1300, moveCue: 'Vuelve al centro' },
    ],
  };
}

// ---------- On all fours, facing right ----------

const HAND_N: Vec = [27, 2];
const HAND_F: Vec = [24, 2];
const fours = (o: Partial<Pose> = {}): Pose => ({
  hip: [-25, 49],
  spine: [98, 98],
  head: 104,
  armN: { ik: HAND_N, hint: [-1, 0] },
  armF: { ik: HAND_F, hint: [-1, 0] },
  legN: { a: [0, -92], foot: -100 },
  legF: { a: [-2, -94], foot: -100 },
  ...o,
});

const birdReach: Pose = fours({
  armF: { ik: [84, 62], hint: [0, 1] },
  legN: { a: [-88, -89], foot: -95 },
});
const birddog: Move = {
  id: 'birddog',
  view: 'side',
  focus: ['back', 'core'],
  frame: [-120, -12, 220],
  props: [{ kind: 'mat', x: -20 }],
  keys: [
    { pose: fours(), hold: 500, holdCue: 'Manos bajo los hombros, rodillas bajo la cadera', move: 1400, moveCue: 'Estira un brazo y la pierna contraria' },
    { pose: birdReach, hold: 800, holdCue: 'Espalda quieta como una mesa', peak: true, move: 1200, moveCue: 'Vuelve despacio' },
    { pose: fours(), hold: 300, move: 1400, moveCue: 'Ahora el otro lado' },
    { pose: swapSides(birdReach), hold: 800, holdCue: 'Mira al suelo, cuello largo', peak: true, move: 1200, moveCue: 'Vuelve despacio' },
  ],
};

const catCow: Move = {
  id: 'cat-cow',
  view: 'side',
  focus: ['back'],
  frame: [-120, -12, 220],
  props: [{ kind: 'mat', x: -20 }],
  keys: [
    { pose: fours({ spine: [120, 76], head: 40 }), hold: 500, holdCue: 'Gato: redondea la espalda y mira al ombligo', move: 1600, moveCue: 'Pasa despacio a la otra postura' },
    { pose: fours({ spine: [80, 116], head: 128 }), hold: 500, holdCue: 'Camello: hunde la espalda y mira al frente', move: 1600, moveCue: 'Vuelve a redondear' },
  ],
};

const thoracic: Move = {
  id: 'thoracic',
  view: 'side',
  focus: ['back'],
  frame: [-120, -12, 220],
  props: [{ kind: 'mat', x: -20 }],
  keys: [
    { pose: fours({ armN: { a: [30, 168] }, head: 70 }), hold: 500, holdCue: 'A cuatro patas, una mano detrás de la cabeza', move: 1700, moveCue: 'Gira y lleva el codo hacia el techo' },
    { pose: fours({ armN: { a: [168, 40] }, spine: [100, 108], head: 150 }), hold: 600, holdCue: 'Sigue el codo con la mirada', peak: true, move: 1700, moveCue: 'Baja el codo hacia la otra mano' },
  ],
};

// ---------- Lying face down, head to the right ----------

const prone = (o: Partial<Pose> = {}): Pose => ({
  hip: [0, 10],
  spine: [90, 90],
  head: 92,
  armN: { a: [92, 92] },
  armF: { a: [92, 91] },
  legN: { a: [-90, -90], foot: -170 },
  legF: { a: [-90, -91], foot: -170 },
  ...o,
});

const superman: Move = {
  id: 'superman',
  view: 'side',
  focus: ['back'],
  frame: [-104, -10, 228],
  props: [{ kind: 'mat', x: 10 }],
  keys: [
    { pose: prone(), hold: 500, holdCue: 'Boca abajo, brazos estirados delante en Y', move: 1300, moveCue: 'Despega brazos, pecho y piernas a la vez' },
    {
      pose: prone({ spine: [95, 103], head: 106, armN: { a: [108, 108] }, armF: { a: [107, 106] }, legN: { a: [-97, -99], foot: -170 }, legF: { a: [-96, -98], foot: -170 } }),
      hold: 1200,
      holdCue: 'Aguanta un segundo, mirada al suelo',
      peak: true,
      move: 1300,
      moveCue: 'Baja despacio',
    },
  ],
};

const lifted = { spine: [92, 97] as [number, number], head: 98 };
const ytw: Move = {
  id: 'ytw',
  view: 'side',
  focus: ['back'],
  frame: [-104, -10, 228],
  props: [{ kind: 'mat', x: 10 }],
  keys: [
    { pose: prone(), hold: 400, holdCue: 'Boca abajo, frente cerca del suelo', move: 900, moveCue: 'Y: sube los brazos en diagonal, pulgares arriba' },
    { pose: prone({ ...lifted, armN: { a: [112, 112] }, armF: { a: [111, 111] } }), hold: 900, holdCue: 'Y', move: 900 },
    { pose: prone(), hold: 300, move: 900, moveCue: 'T: brazos en cruz, a los lados' },
    { pose: prone({ ...lifted, armN: { a: [170, 170], len: 0.35 }, armF: { a: [168, 168], len: 0.35 } }), hold: 900, holdCue: 'T', move: 900 },
    { pose: prone(), hold: 300, move: 900, moveCue: 'W: codos atrás, junta los omóplatos' },
    { pose: prone({ ...lifted, armN: { a: [-150, 120], len: 0.6 }, armF: { a: [-150, 118], len: 0.6 } }), hold: 900, holdCue: 'W', move: 900 },
  ],
};

export const moves: Record<string, Move> = {
  'bridge-short': bridge('bridge-short', 18),
  bridge: bridge('bridge', 32),
  'bridge-single': bridge('bridge-single', 30, true),
  'deadbug-legs': deadbug('deadbug-legs', false),
  deadbug: deadbug('deadbug', true),
  birddog,
  'cat-cow': catCow,
  thoracic,
  superman,
  ytw,
};
