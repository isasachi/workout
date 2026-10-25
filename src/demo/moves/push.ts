import type { Key, Limb, Move, Pose, Vec } from '../types';
import { solve } from '../rig';
import { bodyLine, kneelLine, shoulderOver, shoulderOverKnees, toward } from '../build';

const elbowBack: Vec = [-1, 0.25];

/** A straight-body push-up between ankles A and hands H. */
function straightPush(A: Vec, H: Vec, footAngle: number, armTop = 57, armBottom = 26) {
  const legs = { legN: { ik: A, foot: footAngle } as Limb, legF: { ik: [A[0] - 3, A[1]] as Vec, foot: footAngle } as Limb };
  const arms = { armN: { ik: H, hint: elbowBack } as Limb, armF: { ik: [H[0] - 3, H[1]] as Vec, hint: elbowBack } as Limb };
  const top: Pose = { ...bodyLine(A, shoulderOver(A, H, armTop)), ...arms, ...legs };
  const bottom: Pose = { ...bodyLine(A, shoulderOver(A, H, armBottom)), ...arms, ...legs };
  return { top, bottom };
}

function pushKeys(top: Pose, bottom: Pose, setup: string): Key[] {
  return [
    { pose: top, hold: 500, holdCue: setup, move: 1700, moveCue: 'Baja el pecho entre las manos, codos a 45° del cuerpo' },
    { pose: bottom, hold: 250, holdCue: 'Cuerpo recto de la cabeza a los talones', peak: true, move: 1100, moveCue: 'Empuja y sube sin hundir la cadera' },
  ];
}

// Wall: hands on the wall at chest height.
const wall = straightPush([-58, 6], [34, 126], 90, 56, 38);
const pushupWall: Move = {
  id: 'pushup-wall',
  view: 'side',
  focus: ['arms'],
  props: [{ kind: 'wallFront', x: 38 }],
  keys: pushKeys(wall.top, wall.bottom, 'Manos en la pared a la altura del pecho, pies un paso atrás'),
};

// Counter or table: hands on the edge of the top.
const counter = straightPush([-86, 6], [44, 94], 78, 57, 34);
const pushupCounter = (id: string): Move => ({
  id,
  view: 'side',
  focus: ['arms'],
  props: [{ kind: 'counter', x: 36 }],
  keys: pushKeys(counter.top, counter.bottom, 'Manos en el borde de una mesa firme o encimera'),
});

// Chair or sofa seat, placed against a wall so it cannot slide.
const chair = straightPush([-92, 9], [66, 52], 45, 57, 32);
const pushupChair: Move = {
  id: 'pushup-chair',
  view: 'side',
  focus: ['arms'],
  frame: [-112, -12, 222],
  props: [{ kind: 'chair', x: 100, flip: true }],
  keys: pushKeys(chair.top, chair.bottom, 'Manos en el asiento de una silla apoyada contra la pared'),
};

const floor = straightPush([-92, 11], [42, 2], 35, 57, 28);
const pushup: Move = {
  id: 'pushup',
  view: 'side',
  focus: ['arms'],
  frame: [-112, -12, 190],
  keys: pushKeys(floor.top, floor.bottom, 'Manos bajo los hombros, cuerpo como una tabla'),
};

// Knees on the floor, shins resting behind.
function kneePose(K: Vec, H: Vec, arm: number): Pose {
  const k = kneelLine(K, shoulderOverKnees(K, H, arm));
  return {
    hip: k.hip,
    spine: k.spine,
    head: k.head,
    armN: { ik: H, hint: elbowBack },
    armF: { ik: [H[0] - 3, H[1]], hint: elbowBack },
    legN: { a: [k.thigh, -94], foot: -100 },
    legF: { a: [k.thigh, -96], foot: -100 },
  };
}
const kneeK: Vec = [-42, 7];
const pushupKnees: Move = {
  id: 'pushup-knees',
  view: 'side',
  focus: ['arms'],
  frame: [-112, -12, 190],
  props: [{ kind: 'mat', x: -10 }],
  keys: pushKeys(kneePose(kneeK, [44, 2], 57), kneePose(kneeK, [44, 2], 28), 'Rodillas en el suelo (sobre una toalla), manos bajo los hombros'),
};

// ---------- Pike push-ups ----------

function pike(id: string, H: Vec, A: Vec, hipTop: Vec, hipBottom: Vec, props: Move['props'], setup: string): Move {
  const arms = (h: Vec) => ({ armN: { ik: h, hint: [-1, 0] as Vec }, armF: { ik: [h[0] - 3, h[1]] as Vec, hint: [-1, 0] as Vec } });
  const legs = { legN: { ik: A, foot: 75 }, legF: { ik: [A[0] - 3, A[1]] as Vec, foot: 75 } };
  const sTop = toward(hipTop, H);
  const top: Pose = { hip: hipTop, spine: [sTop, sTop], head: sTop - 8, ...arms(H), ...legs };
  const bottom: Pose = { hip: hipBottom, spine: [sTop + 10, sTop + 14], head: sTop - 4, ...arms(H), ...legs };
  return {
    id,
    view: 'side',
    focus: ['arms'],
    frame: [-100, -12, 210],
    props,
    keys: [
      { pose: top, hold: 500, holdCue: setup, move: 1700, moveCue: 'Dobla los codos y lleva la cabeza hacia delante de las manos' },
      { pose: bottom, hold: 250, holdCue: 'Cadera alta todo el tiempo', peak: true, move: 1100, moveCue: 'Empuja y vuelve a estirar los brazos' },
    ],
  };
}

const pikeChair = pike('pike-chair', [76, 52], [-44, 6], [-18, 88], [-6, 82], [{ kind: 'chair', x: 108, flip: true }], 'Manos en una silla contra la pared, cadera alta');
const pikeFloor = pike('pike', [56, 2], [-50, 6], [-12, 82], [0, 64], [], 'Manos y pies en el suelo, cadera alta como una V invertida');

// ---------- Planks ----------

function hold(id: string, a: Pose, b: Pose, setup: string, props: Move['props'] = [], frame?: Move['frame']): Move {
  return {
    id,
    view: 'side',
    focus: ['core'],
    props,
    frame,
    keys: [
      { pose: a, hold: 2600, holdCue: setup, move: 1400 },
      { pose: b, hold: 2600, holdCue: 'Respira con normalidad; aprieta abdomen y glúteos', move: 1400 },
    ],
  };
}

const forearms = (S: Vec): { armN: Limb; armF: Limb } => ({ armN: { a: [toward(S, [S[0], 3]), 90] }, armF: { a: [toward(S, [S[0] - 3, 3]), 90] } });
const breathe = (p: Pose, dy: number): Pose => ({ ...p, hip: [p.hip[0], p.hip[1] + dy] });

const plankS: Vec = [26, 33];
const plankA: Vec = [-110, 11];
const plankFull: Pose = { ...bodyLine(plankA, plankS), ...forearms(plankS), legN: { ik: plankA, foot: 30 }, legF: { ik: [plankA[0] - 3, plankA[1]], foot: 30 } };
const plank = hold('plank', plankFull, breathe(plankFull, 1.2), 'Codos bajo los hombros, cuerpo en línea recta', [], [-128, -12, 196]);

const kneesK: Vec = [-62, 7];
const kp = kneelLine(kneesK, plankS);
const plankKneesPose: Pose = { hip: kp.hip, spine: kp.spine, head: kp.head, ...forearms(plankS), legN: { a: [kp.thigh, -94], foot: -100 }, legF: { a: [kp.thigh, -96], foot: -100 } };
const plankKnees = hold('plank-knees', plankKneesPose, breathe(plankKneesPose, 1), 'Codos bajo los hombros, rodillas apoyadas, cadera alineada', [{ kind: 'mat', x: -30 }], [-128, -12, 196]);

const plankWall = hold('plank-wall', counter.top, breathe(counter.top, 1), 'Manos en la encimera, cuerpo recto como en una flexión', [{ kind: 'counter', x: 36 }]);

const high = straightPush([-92, 11], [42, 2], 35, 57, 22).top;
const tap = (side: 'N' | 'F'): Pose => {
  const S = solve(high, 'side').shoulder;
  const target: Vec = [S[0] + 3, S[1] - 7];
  return side === 'N'
    ? { ...high, armN: { ik: target, hint: [0, -1] } }
    : { ...high, armF: { ik: target, hint: [0, -1] } };
};
const plankTaps: Move = {
  id: 'plank-taps',
  view: 'side',
  focus: ['core'],
  frame: [-112, -12, 190],
  keys: [
    { pose: high, hold: 500, holdCue: 'Plancha alta: pies algo separados para no balancearte', move: 600, moveCue: 'Toca el hombro contrario' },
    { pose: tap('N'), hold: 300, holdCue: 'La cadera no se mueve', move: 600 },
    { pose: high, hold: 300, move: 600, moveCue: 'Ahora la otra mano' },
    { pose: tap('F'), hold: 300, holdCue: 'La cadera no se mueve', move: 600 },
  ],
};

// ---------- Mountain climbers ----------

const knee = (side: 'N' | 'F'): Pose => {
  const leg: Limb = { ik: [high.hip[0] - 6, 18], hint: [1, -0.3], foot: 40 };
  return side === 'N' ? { ...high, legN: leg } : { ...high, legF: leg };
};
const climber: Move = {
  id: 'climber',
  view: 'side',
  focus: ['core', 'legs'],
  frame: [-112, -12, 190],
  keys: [
    { pose: high, hold: 120, holdCue: 'Plancha alta, manos bajo los hombros', move: 550, moveCue: 'Lleva una rodilla hacia el pecho, sin saltar' },
    { pose: knee('N'), hold: 150, move: 550, moveCue: 'Vuelve y cambia de pierna' },
    { pose: high, hold: 120, move: 550, moveCue: 'Lleva la otra rodilla hacia el pecho' },
    { pose: knee('F'), hold: 150, move: 550, moveCue: 'Ritmo constante, cadera baja' },
  ],
};

export const moves: Record<string, Move> = {
  'pushup-wall': pushupWall,
  'pushup-counter': pushupCounter('pushup-counter'),
  'pushup-chair': pushupChair,
  'pushup-knees': pushupKnees,
  pushup,
  'pike-chair': pikeChair,
  pike: pikeFloor,
  'plank-wall': plankWall,
  'plank-knees': plankKnees,
  plank,
  'plank-taps': plankTaps,
  climber,
};
