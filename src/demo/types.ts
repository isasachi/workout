// Coordinates: y points up, ground at y = 0, the figure faces +x in side view.
// Angles are absolute, in degrees: 0 points down, 90 points forward (+x), 180 points up.

export type Vec = [number, number];

export type Limb = {
  /** Upper and lower segment angles. */
  a?: [number, number];
  /** End-point target, solved with two-bone IK. */
  ik?: Vec;
  /** Direction the middle joint (knee or elbow) should point to when solving IK. */
  hint?: Vec;
  /** Foot angle for legs (default 90, flat on the floor facing forward). */
  foot?: number;
  /** Length factor, to fake foreshortening of a limb pointing at the camera. */
  len?: number;
};

export type Pose = {
  hip: Vec;
  /** Lower and upper back angles (180 = upright). */
  spine: [number, number];
  /** Neck and head direction; defaults to the upper back angle. */
  head?: number;
  armN: Limb;
  armF: Limb;
  legN: Limb;
  legF: Limb;
};

export type Key = {
  pose: Pose;
  /** Time held at this pose, in ms. */
  hold?: number;
  /** Time to travel to the next pose, in ms. */
  move?: number;
  /** Cue shown while holding this pose. */
  holdCue?: string;
  /** Cue shown while travelling to the next pose. */
  moveCue?: string;
  /** Marks the hardest point of the rep, where a "pause" variant holds 2 s. */
  peak?: boolean;
};

export type PropKind =
  | 'chair'
  | 'chairBehind'
  | 'wallFront'
  | 'wallBehind'
  | 'counter'
  | 'step'
  | 'door'
  | 'backpackBack'
  | 'backpackHands'
  | 'mat';

export type Prop = { kind: PropKind; x?: number; flip?: boolean };

export type FocusGroup = 'legs' | 'arms' | 'core' | 'back';

export type Move = {
  id: string;
  view: 'side' | 'front';
  keys: Key[];
  props?: Prop[];
  focus?: FocusGroup[];
  /** Camera box in world units: [minX, minY, width]; height follows the demo's fixed aspect. */
  frame?: [number, number, number];
};

export type Joints = {
  pelvis: Vec;
  mid: Vec;
  shoulder: Vec;
  headC: Vec;
  hipN: Vec;
  hipF: Vec;
  kneeN: Vec;
  kneeF: Vec;
  ankleN: Vec;
  ankleF: Vec;
  heelN: Vec;
  heelF: Vec;
  toeN: Vec;
  toeF: Vec;
  shN: Vec;
  shF: Vec;
  elbowN: Vec;
  elbowF: Vec;
  wristN: Vec;
  wristF: Vec;
};
