import type { Key, Move, Pose, Vec } from '../types';
import { stand, standFront, tempo } from '../build';
import { dir } from '../rig';

// ---------- Marching and high knees ----------

const kneeUpN = stand({
  legN: { a: [82, 6], foot: 100 },
  legF: { a: [0, 0] },
  armN: { a: [-30, 10] },
  armF: { a: [40, 120] },
});
const kneeUpF = stand({
  legF: { a: [82, 6], foot: 100 },
  legN: { a: [0, 0] },
  armF: { a: [-30, 10] },
  armN: { a: [40, 120] },
});

function marchKeys(f: number, cue: string): Key[] {
  return tempo(
    [
      { pose: kneeUpN, hold: 120, holdCue: cue, move: 380 },
      { pose: kneeUpF, hold: 120, move: 380 },
    ],
    f,
  );
}

const march: Move = { id: 'march', view: 'side', focus: ['legs'], keys: marchKeys(1.2, 'Rodilla a la altura de la cadera, brazo contrario adelante') };
const highKnees: Move = { id: 'high-knees', view: 'side', focus: ['legs'], keys: marchKeys(0.7, 'Rápido y sin saltar: apoya la punta del pie') };

// ---------- Walking in place ----------

const walkA = stand({
  hip: [0, 90],
  spine: [176, 178],
  legN: { a: [24, 10], foot: 105 },
  legF: { a: [-18, -30], foot: 60 },
  armN: { a: [-38, -30] },
  armF: { a: [36, 62] },
});
const walkB = stand({
  hip: [0, 92],
  spine: [176, 178],
  legN: { a: [0, 0] },
  legF: { a: [16, -34], foot: 70 },
  armN: { a: [0, 6] },
  armF: { a: [0, 6] },
});
const swap = (p: Pose): Pose => ({ ...p, legN: p.legF, legF: p.legN, armN: p.armF, armF: p.armN });
const walk: Move = {
  id: 'walk',
  view: 'side',
  focus: ['legs'],
  keys: [
    { pose: walkA, hold: 0, holdCue: 'Paso ágil, braceo natural', move: 380 },
    { pose: walkB, hold: 0, move: 380 },
    { pose: swap(walkA), hold: 0, move: 380 },
    { pose: swap(walkB), hold: 0, move: 380 },
  ],
};

// ---------- Front view moves ----------

const jack: Move = {
  id: 'jack-step',
  view: 'front',
  frame: [-120, -12, 240],
  keys: [
    { pose: standFront(), hold: 150, holdCue: 'Pies juntos, brazos abajo', move: 450, moveCue: 'Paso al lado y brazos arriba, sin saltar' },
    { pose: standFront({ hip: [4, 88], legN: { ik: [40, 6] }, armN: { a: [150, 172] }, armF: { a: [-150, -172] } }), hold: 150, move: 450, moveCue: 'Vuelve al centro' },
    { pose: standFront(), hold: 150, move: 450, moveCue: 'Ahora hacia el otro lado' },
    { pose: standFront({ hip: [-4, 88], legF: { ik: [-40, 6] }, armN: { a: [150, 172] }, armF: { a: [-150, -172] } }), hold: 150, move: 450, moveCue: 'Vuelve al centro' },
  ],
};

const skaterSide = (s: 1 | -1): Pose => {
  const base = standFront({
    hip: [26 * s, 70],
    spine: [180 - 12 * s, 180 - 14 * s],
  });
  const plant: Vec = [42 * s, 6];
  const cross: Vec = [-8 * s, 12];
  return s === 1
    ? { ...base, legN: { ik: plant }, legF: { ik: cross, hint: [0.5, 0.3], foot: 90 }, armF: { a: [40, 60] }, armN: { a: [30, 40] } }
    : { ...base, legF: { ik: plant }, legN: { ik: cross, hint: [-0.5, 0.3], foot: 90 }, armN: { a: [-40, -60] }, armF: { a: [-30, -40] } };
};
const skater: Move = {
  id: 'skater',
  view: 'front',
  focus: ['legs'],
  frame: [-110, -12, 220],
  keys: [
    { pose: skaterSide(1), hold: 250, holdCue: 'Paso amplio al lado y flexiona esa rodilla', move: 380, moveCue: 'Cambia de lado con un paso, sin saltar' },
    { pose: standFront({ hip: [0, 84] }), hold: 0, move: 380 },
    { pose: skaterSide(-1), hold: 250, holdCue: 'La pierna libre pasa por detrás', move: 380, moveCue: 'Cambia de lado' },
    { pose: standFront({ hip: [0, 84] }), hold: 0, move: 380 },
  ],
};

const handsOnHips = { armN: { ik: [20, 94] as Vec, hint: [1, 0] as Vec }, armF: { ik: [-20, 94] as Vec, hint: [-1, 0] as Vec } };
const circle = (dx: number, dy: number): Pose =>
  standFront({ hip: [dx, 89 + dy], spine: [180 - dx * 1.1, 180 - dx * 0.4], legN: { ik: [16, 6] }, legF: { ik: [-16, 6] }, ...handsOnHips });
const hipCircles: Move = {
  id: 'hip-circles',
  view: 'front',
  focus: ['core'],
  frame: [-100, -12, 200],
  keys: [
    { pose: circle(9, 0), hold: 0, holdCue: 'Manos en la cintura, dibuja círculos amplios con la cadera', move: 500 },
    { pose: circle(0, 2), hold: 0, move: 500 },
    { pose: circle(-9, 0), hold: 0, move: 500 },
    { pose: circle(0, -2), hold: 0, move: 500, moveCue: 'Diez hacia un lado y diez hacia el otro' },
  ],
};

const wallAngels: Move = {
  id: 'wall-angels',
  view: 'front',
  focus: ['back'],
  frame: [-120, -12, 240],
  props: [{ kind: 'wallBehind', x: 0 }],
  keys: [
    { pose: standFront({ armN: { a: [98, 172] }, armF: { a: [-98, -172] } }), hold: 400, holdCue: 'Espalda, cabeza y brazos pegados a la pared', move: 1500, moveCue: 'Desliza los brazos hacia arriba' },
    { pose: standFront({ armN: { a: [150, 160] }, armF: { a: [-150, -160] } }), hold: 300, holdCue: 'Sube hasta donde los brazos sigan tocando la pared', move: 1500, moveCue: 'Baja con los codos hacia las costillas' },
  ],
};

// ---------- Shadow boxing ----------

const guard = stand({
  hip: [0, 88],
  spine: [172, 176],
  head: 172,
  legN: { ik: [24, 6] },
  legF: { ik: [-22, 6] },
  armN: { a: [40, 165] },
  armF: { a: [30, 160] },
});
const jab: Pose = { ...guard, armN: { a: [92, 92] } };
const cross: Pose = { ...guard, spine: [168, 168], armF: { a: [94, 92] } };
const shadowBox: Move = {
  id: 'shadow-box',
  view: 'side',
  focus: ['arms'],
  keys: [
    { pose: guard, hold: 250, holdCue: 'Pies escalonados, puños a la altura de la barbilla', move: 200 },
    { pose: jab, hold: 80, holdCue: 'Golpe recto con el brazo de delante', move: 220 },
    { pose: guard, hold: 120, move: 200 },
    { pose: cross, hold: 80, holdCue: 'Golpe recto con el de atrás, girando la cadera', move: 220 },
  ],
};

// ---------- Towel row on a door ----------

const KNOB: Vec = [66, 95];
function towelPose(ankleX: number, lean: number, pulled: boolean): Pose {
  const A: Vec = [ankleX, 6];
  const u = dir(180 + lean);
  const hip: Vec = [A[0] + u[0] * 86, A[1] + u[1] * 86];
  const S: Vec = [A[0] + u[0] * 139, A[1] + u[1] * 139];
  const toKnob: Vec = [KNOB[0] - S[0], KNOB[1] - S[1]];
  const len = Math.hypot(toKnob[0], toKnob[1]);
  const hand: Vec = pulled ? [S[0] + 18, S[1] - 14] : [S[0] + (toKnob[0] / len) * 56, S[1] + (toKnob[1] / len) * 56];
  const a = 180 + lean;
  return {
    hip,
    spine: [a, a],
    head: a - 4,
    armN: { ik: hand, hint: [-1, -0.4] },
    armF: { ik: [hand[0] - 2, hand[1] + 2], hint: [-1, -0.4] },
    legN: { ik: A, foot: 70 },
    legF: { ik: [A[0] - 3, A[1]], foot: 70 },
  };
}
function towelRow(id: string, ankleX: number, leanOut: number, leanIn: number): Move {
  return {
    id,
    view: 'side',
    focus: ['back', 'arms'],
    frame: [-100, -12, 215],
    props: [{ kind: 'door', x: 70 }],
    keys: [
      { pose: towelPose(ankleX, leanOut, false), hold: 500, holdCue: 'Toalla por el pomo de una puerta bien cerrada que se abre hacia el otro lado', move: 1200, moveCue: 'Tira del pecho hacia la puerta, codos pegados' },
      { pose: towelPose(ankleX, leanIn, true), hold: 400, holdCue: 'Junta los omóplatos', peak: true, move: 1600, moveCue: 'Baja despacio, cuerpo recto como una tabla' },
    ],
  };
}

export const moves: Record<string, Move> = {
  march,
  'high-knees': highKnees,
  walk,
  'jack-step': jack,
  skater,
  'hip-circles': hipCircles,
  'wall-angels': wallAngels,
  'shadow-box': shadowBox,
  'row-towel-far': towelRow('row-towel-far', 14, 18, 7),
  'row-towel-near': towelRow('row-towel-near', 44, 32, 16),
};
