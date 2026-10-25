import {
  Bone, BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, Group, Matrix4, MeshStandardMaterial,
  Quaternion, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3,
} from 'three';
import binUrl from './mannequin/mannequin.bin?url';
import meta from './mannequin/mannequin.json';
import type { FocusGroup, Joints, Vec } from '../types';

// Anatomical mannequin from MakeHuman's CC0 base mesh (see dev/mannequin/build.py).
// The skinned mesh lives in MakeHuman space: y up, facing +z, the figure's left at +x.
// Each frame the rig's joints are mapped into that space and every body segment
// (lower back, thigh, forearm...) is turned rigidly so its rest axis points along
// the rig's segment, keeping the natural curves of the spine and the bent rest arms.

type BoneMeta = { name: string; parent: number; head: number[]; tail: number[] };
const BONES = meta.bones as BoneMeta[];
const idx = (n: string) => BONES.findIndex((b) => b.name === n);
const head = (n: string) => new Vector3().fromArray(BONES[idx(n)].head);
const mid = (a: Vector3, b: Vector3) => a.clone().add(b).multiplyScalar(0.5);

let data: Promise<ArrayBuffer> | null = null;
export const loadMannequinData = () =>
  (data ??= fetch(binUrl).then((r) => {
    if (!r.ok) throw new Error('mannequin ' + r.status);
    return r.arrayBuffer();
  }));

const X = new Vector3(1, 0, 0);
const Z = new Vector3(0, 0, 1);

/** Rotation of the orthonormal frame built from a bone direction and a hinge across it. */
function frameQuat(hinge: Vector3, dir: Vector3) {
  const y = dir.clone().normalize();
  const x = hinge.clone().addScaledVector(y, -hinge.dot(y)).normalize();
  const z = new Vector3().crossVectors(x, y);
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(x, y, z));
}

/** A rigid body segment: its bones, the rig points it spans, and its rest axis. */
type Seg = {
  bones: number[];
  from: string;
  to: string;
  restHinge: Vector3;
  /** Which way the front-view hinge turns relative to the bone, so it matches the rest hinge. */
  frontSign: number;
  restInv: Quaternion;
  foot: boolean;
};

type Arm = { upper: Seg; fore: Seg; hand: Seg; l1: number; l2: number; palmQ: Quaternion; contact: Vector3 };

/** Surfaces a hand can rest on, in scene space: a top at some height, or a wall facing -x. */
export type Support = { top: number; x0: number; x1: number } | { wall: number };

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** How firmly a rig wrist rests on a support (0–1), with the palm's facing and finger direction. */
function contactOf(w: Vec, e: Vec, supports: Support[]) {
  let best = { k: 0, normal: new Vector3(), fingers: new Vector3(), at: new Vector3() };
  for (const s of supports) {
    if ('wall' in s) {
      const d = s.wall - w[0];
      const k = d > -3 ? 1 - smooth(5, 10, d) : 0;
      if (k > best.k) best = { k, normal: new Vector3(1, 0, 0), fingers: new Vector3(0, 1, 0), at: new Vector3(s.wall, w[1], 0) };
    } else if (w[0] > s.x0 - 4 && w[0] < s.x1 + 4) {
      const d = w[1] - s.top;
      const k = d > -4 ? 1 - smooth(4, 9, d) : 0;
      // Fingers point ahead, or along the forearm when it lies on the surface (bridges, side planks).
      const fx = w[0] - e[0];
      const flat = Math.abs(w[1] - e[1]) < Math.abs(fx) * 0.8;
      if (k > best.k) best = { k, normal: new Vector3(0, -1, 0), fingers: new Vector3(flat ? Math.sign(fx) || 1 : 1, 0, 0), at: new Vector3(w[0], s.top, 0) };
    }
  }
  return best;
}

export class Mannequin {
  root = new Group();
  private bones: Bone[] = [];
  private segs: Seg[] = [];
  private segOf: (Seg | undefined)[] = [];
  private hipRest: Vector3;
  private arms = {} as Record<'L' | 'R', Arm>;
  private skin: MeshStandardMaterial;
  private shortsMat: MeshStandardMaterial;
  private body: SkinnedMesh;
  private shorts: SkinnedMesh;
  private colors: BufferAttribute;
  private mask: Record<string, Float32Array> = {};

  constructor(buf: ArrayBuffer) {
    const n = meta.vertices;
    let o = 0;
    const pos = new Float32Array(buf.slice(o, (o += n * 12)));
    const si = new Uint8Array(buf.slice(o, (o += n * 4)));
    const sw = new Uint8Array(buf.slice(o, (o += n * 4)));
    const bodyIdx = new Uint16Array(buf.slice(o, (o += meta.bodyIndices * 2)));
    const shortsIdx = new Uint16Array(buf.slice(o, o + meta.shortsIndices * 2));

    const skinIndex = new Uint16BufferAttribute(Uint16Array.from(si), 4);
    const skinWeight = new Float32BufferAttribute(Float32Array.from(sw, (v) => v / 255), 4);
    const geo = (index: Uint16Array) => {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(pos, 3));
      g.setAttribute('skinIndex', skinIndex);
      g.setAttribute('skinWeight', skinWeight);
      g.setIndex(new BufferAttribute(index, 1));
      g.computeVertexNormals();
      return g;
    };
    const bodyGeo = geo(bodyIdx);
    // Vertex colours carry the muscle highlight; white leaves the clay colour as is.
    this.colors = new Float32BufferAttribute(new Float32Array(n * 3).fill(1), 3);
    bodyGeo.setAttribute('color', this.colors);
    const shortsGeo = geo(shortsIdx);

    // Bind pose: no rotations, each bone offset from its parent's head.
    BONES.forEach((b) => {
      const bone = new Bone();
      bone.name = b.name;
      bone.position.fromArray(b.head);
      if (b.parent >= 0) {
        bone.position.sub(new Vector3().fromArray(BONES[b.parent].head));
        this.bones[b.parent].add(bone);
      }
      this.bones.push(bone);
    });

    this.hipRest = mid(head('upperleg01.L'), head('upperleg01.R'));
    const seg = (names: string[], from: string, to: string, restDir: Vector3, hinge = X.clone(), foot = false) => {
      restDir = restDir.clone().normalize();
      const s: Seg = {
        bones: names.map(idx),
        from,
        to,
        restHinge: hinge,
        frontSign: Math.sign(new Vector3().crossVectors(restDir, Z).dot(hinge)) || 1,
        restInv: frameQuat(hinge, restDir).invert(),
        foot,
      };
      this.segs.push(s);
      for (const i of s.bones) this.segOf[i] = s;
      return s;
    };
    const span = (a: string, b: string) => head(b).sub(head(a));
    // The rig's upright trunk and head (180°) mean the mesh's own relaxed standing posture.
    const up = new Vector3(0, 1, 0);
    seg(['root', 'spine05', 'spine04', 'spine03'], 'pelvis', 'mid', up);
    seg(['spine02', 'spine01'], 'mid', 'shoulder', up);
    seg(['neck01', 'neck02', 'neck03', 'head'], 'shoulder', 'headC', up);
    for (const s of ['L', 'R'] as const) {
      const upper = span(`upperarm01.${s}`, `lowerarm01.${s}`);
      const fore = span(`lowerarm01.${s}`, `wrist.${s}`);
      // The rest arms are bent; the plane of that bend gives the elbow's hinge.
      const elbowAxis = new Vector3().crossVectors(upper, fore).normalize();
      seg([`upperleg01.${s}`, `upperleg02.${s}`], `hip${s}`, `knee${s}`, span(`upperleg01.${s}`, `lowerleg01.${s}`));
      seg([`lowerleg01.${s}`, `lowerleg02.${s}`], `knee${s}`, `ankle${s}`, span(`lowerleg01.${s}`, `foot.${s}`));
      // Feet: the sole is flat and points straight ahead at rest.
      seg([`foot.${s}`], `heel${s}`, `toe${s}`, Z, X.clone(), true);
      const m = s === 'L' ? 1 : -1;
      this.arms[s] = {
        upper: seg([`upperarm01.${s}`, `upperarm02.${s}`], `sh${s}`, `elbow${s}`, upper, elbowAxis),
        fore: seg([`lowerarm01.${s}`, `lowerarm02.${s}`], `elbow${s}`, `wrist${s}`, fore, elbowAxis.clone()),
        hand: seg([`wrist.${s}`], `elbow${s}`, `wrist${s}`, fore, elbowAxis.clone()),
        l1: upper.length(),
        l2: fore.length(),
        // Measured on the mesh: the hand's long axis, the normal out of the palm, and the
        // middle of the palm's skin, from the wrist joint.
        palmQ: frameQuat(new Vector3(-0.694 * m, -0.69, -0.205), new Vector3(0.296 * m, -0.605, 0.737)).invert(),
        contact: new Vector3(1.94 * m, -3.97, 4.83).addScaledVector(new Vector3(-0.694 * m, -0.69, -0.205), 1.6),
      };
    }

    this.skin = new MeshStandardMaterial({ color: '#dcdce1', roughness: 0.6, metalness: 0, vertexColors: true });
    this.shortsMat = new MeshStandardMaterial({
      color: '#34343a', roughness: 0.85, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    this.body = new SkinnedMesh(bodyGeo, this.skin);
    this.shorts = new SkinnedMesh(shortsGeo, this.shortsMat);
    this.root.add(this.bones[0], this.body, this.shorts);
    this.root.updateMatrixWorld(true);
    const skeleton = new Skeleton(this.bones);
    for (const m of [this.body, this.shorts]) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
      m.bind(skeleton);
    }
    this.buildMasks(pos, si, sw, bodyGeo.getAttribute('normal') as BufferAttribute);
  }

  /** Soft per-vertex masks for the muscles a move can highlight, from bone weights and rest normals. */
  private buildMasks(pos: Float32Array, si: Uint8Array, sw: Uint8Array, nrm: BufferAttribute) {
    const n = meta.vertices;
    const both = (...names: string[]) => names.flatMap((b) => [idx(b + '.L'), idx(b + '.R')]);
    const ids = (...names: string[]) => names.map(idx);
    const w = (v: number, set: number[]) => {
      let s = 0;
      for (let k = 0; k < 4; k++) if (set.includes(si[v * 4 + k])) s += sw[v * 4 + k] / 255;
      return s;
    };
    const sm = (a: number, b: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const thigh = both('upperleg01', 'upperleg02');
    const shin = both('lowerleg01', 'lowerleg02');
    const upperArm = both('upperarm01', 'upperarm02', 'shoulder01');
    const chest = [...ids('spine01', 'spine02'), ...both('clavicle', 'shoulder01')];
    const belly = ids('spine03', 'spine04');
    const hips = [...ids('spine05', 'root'), ...both('pelvis')];
    const make = (f: (v: number, front: number, y: number, lat: number) => number) => {
      const out = new Float32Array(n);
      for (let v = 0; v < n; v++) out[v] = Math.min(1, Math.max(0, f(v, nrm.getZ(v), pos[v * 3 + 1], Math.abs(pos[v * 3]))));
      return out;
    };
    this.mask = {
      quads: make((v, f) => w(v, thigh) * sm(0.05, 0.5, f)),
      hams: make((v, f) => w(v, thigh) * sm(0.05, 0.5, -f)),
      glutes: make((v, f, y) => w(v, [...hips, ...thigh]) * sm(0.1, 0.5, -f) * sm(-12, -4, y) * (1 - sm(14, 20, y))),
      calves: make((v, f) => w(v, shin) * sm(0.05, 0.5, -f)),
      pecs: make((v, f, y, lat) => w(v, chest) * sm(0.2, 0.6, f) * sm(42, 47, y) * (1 - sm(58, 62, y)) * (1 - sm(17, 21, lat))),
      abs: make((v, f, y, lat) => w(v, [...belly, ...ids('spine02', 'spine05')]) * sm(0.25, 0.65, f) * sm(12, 17, y) * (1 - sm(40, 44, y)) * (1 - sm(10, 13, lat))),
      upperBack: make((v, f, y) => w(v, [...chest, idx('spine03')]) * sm(0.1, 0.55, -f) * sm(30, 36, y)),
      lowerBack: make((v, f, y, lat) => w(v, [...belly, ...hips]) * sm(0.2, 0.6, -f) * sm(16, 20, y) * (1 - sm(32, 36, y)) * (1 - sm(9, 13, lat))),
      shoulders: make((v) => w(v, both('shoulder01', 'upperarm01'))),
      triceps: make((v, f) => w(v, upperArm) * sm(0, 0.45, -f)),
      biceps: make((v, f) => w(v, upperArm) * sm(0, 0.45, f)),
    };
  }

  setFocus(focus: FocusGroup[]) {
    const f = new Set(focus);
    const on: string[] = [];
    if (f.has('legs')) on.push(...(f.has('back') ? ['hams', 'glutes'] : ['quads', 'glutes']));
    if (f.has('arms')) on.push(...(f.has('back') ? ['upperBack', 'biceps', 'shoulders'] : ['pecs', 'triceps', 'shoulders']));
    if (f.has('back')) on.push(f.has('arms') ? 'upperBack' : 'lowerBack');
    if (f.has('back') && !f.has('arms') && !f.has('legs')) on.push('upperBack', 'glutes');
    if (f.has('core')) on.push('abs');
    // Lime over clay, blended per vertex by the strongest mask; the clay tint is divided out so lime stays true.
    const clay = this.skin.color;
    const lime = new Color('#b8f23f');
    const t = [lime.r / clay.r, lime.g / clay.g, lime.b / clay.b];
    const arr = this.colors.array as Float32Array;
    for (let v = 0; v < meta.vertices; v++) {
      let k = 0;
      for (const m of on) k = Math.max(k, this.mask[m][v]);
      for (let c = 0; c < 3; c++) arr[v * 3 + c] = 1 + (t[c] - 1) * k;
    }
    this.colors.needsUpdate = true;
  }

  /**
   * Poses the skeleton from rig joints. Side view: the figure faces +x and its near
   * side (its right) is at +z. Front view: it faces the camera and near is its left.
   */
  pose(j: Joints, front: boolean, hipZ: number, shoulderZ: number, supports: Support[] = []) {
    // Scene → MakeHuman space; the side view turns the whole body a quarter turn.
    this.root.rotation.y = front ? 0 : Math.PI / 2;
    const toMH = (v: Vec, z: number) => (front ? new Vector3(v[0], v[1], 0) : new Vector3(-z, v[1], v[0]));
    const pts: Record<string, Vector3> = {
      pelvis: toMH(j.pelvis, 0),
      mid: toMH(j.mid, 0),
      shoulder: toMH(j.shoulder, 0),
      headC: toMH(j.headC, 0),
    };
    const sides = [[front ? 'L' : 'R', 'N', 1], [front ? 'R' : 'L', 'F', -1]] as const;
    const planted: Partial<Record<'L' | 'R', ReturnType<typeof contactOf>>> = {};
    for (const [s, rig, k] of sides) {
      const J = (name: string) => j[(name + rig) as keyof Joints];
      for (const p of ['hip', 'knee', 'ankle', 'heel', 'toe']) pts[p + s] = toMH(J(p), k * (front ? 0 : hipZ));
      for (const p of ['sh', 'elbow', 'wrist']) pts[p + s] = toMH(J(p), k * (front ? 0 : shoulderZ));
      if (!front) {
        const c = contactOf(J('wrist'), J('elbow'), supports);
        if (c.k > 0) {
          const dir = (v: Vector3) => new Vector3(-v.z, v.y, v.x);
          planted[s] = { k: c.k, normal: dir(c.normal), fingers: dir(c.fingers), at: toMH([c.at.x, c.at.y], k * shoulderZ) };
        }
      }
    }

    const segQ = new Map<Seg, Quaternion>();
    for (const s of this.segs) {
      if (front && s.foot) {
        segQ.set(s, new Quaternion()); // feet keep pointing at the camera
        continue;
      }
      const dir = pts[s.to].clone().sub(pts[s.from]);
      // Side view: everything hinges on the lateral axis. Front view: on the camera axis.
      const hinge = front
        ? new Vector3().crossVectors(dir, Z).normalize().multiplyScalar(s.frontSign)
        : new Vector3(Math.sign(s.restHinge.x) || 1, 0, 0);
      segQ.set(s, frameQuat(hinge, dir).multiply(s.restInv));
    }

    const worldQ: Quaternion[] = [];
    const worldP: Vector3[] = [];
    BONES.forEach((b, i) => {
      const parentQ = b.parent >= 0 ? worldQ[b.parent] : new Quaternion();
      const parentP = b.parent >= 0 ? worldP[b.parent] : new Vector3();
      const s = this.segOf[i];
      const h = new Vector3().fromArray(b.head);
      // Every bone hangs off its parent at its rest offset...
      let p = b.parent < 0 ? new Vector3() : h.clone().sub(new Vector3().fromArray(BONES[b.parent].head)).applyQuaternion(parentQ).add(parentP);
      const side = b.name.slice(-1) as 'L' | 'R';
      const plant = planted[side];
      if (plant && b.name.startsWith('upperarm01.')) this.plantArm(this.arms[side], p, plant, pts, side, segQ);
      const q = s ? segQ.get(s)! : parentQ.clone();
      // ...except the root, placed so the hip joints' midpoint lands on the rig's pelvis.
      if (b.parent < 0) p = pts.pelvis.clone().sub(this.hipRest.clone().sub(h).applyQuaternion(q));
      worldQ[i] = q;
      worldP[i] = p;
      const inv = parentQ.clone().invert();
      this.bones[i].quaternion.copy(inv.clone().multiply(q));
      this.bones[i].position.copy(p.clone().sub(parentP).applyQuaternion(inv));
    });
  }

  /**
   * A hand resting on a support lies flat, palm on the surface; the arm is re-solved
   * with the mesh's own bone lengths so the palm lands where the rig's hand is.
   */
  private plantArm(arm: Arm, S: Vector3, c: { k: number; normal: Vector3; fingers: Vector3; at: Vector3 }, pts: Record<string, Vector3>, s: string, segQ: Map<Seg, Quaternion>) {
    const handQ = frameQuat(c.normal, c.fingers).multiply(arm.palmQ);
    const free = S.clone()
      .addScaledVector(pts['elbow' + s].clone().sub(pts['sh' + s]).normalize(), arm.l1)
      .addScaledVector(pts['wrist' + s].clone().sub(pts['elbow' + s]).normalize(), arm.l2);
    const P = free.lerp(c.at.clone().sub(arm.contact.clone().applyQuaternion(handQ)), c.k);
    // Two-bone IK in the side plane, bending the elbow the way the rig does.
    const d = P.clone().sub(S);
    const len = Math.min(arm.l1 + arm.l2 - 0.01, Math.max(Math.abs(arm.l1 - arm.l2) + 0.01, d.length()));
    const u = d.normalize();
    const a = Math.acos((arm.l1 ** 2 + len ** 2 - arm.l2 ** 2) / (2 * arm.l1 * len));
    const c1 = u.clone().applyAxisAngle(X, a);
    const c2 = u.clone().applyAxisAngle(X, -a);
    const hint = pts['elbow' + s].clone().sub(pts['sh' + s]);
    const E = S.clone().addScaledVector(hint.dot(c1) >= hint.dot(c2) ? c1 : c2, arm.l1);
    const W = S.clone().addScaledVector(u, len);
    const hinge = new Vector3(Math.sign(arm.upper.restHinge.x) || 1, 0, 0);
    segQ.set(arm.upper, frameQuat(hinge, E.clone().sub(S)).multiply(arm.upper.restInv));
    const fore = frameQuat(hinge, W.sub(E)).multiply(arm.fore.restInv);
    segQ.set(arm.fore, fore);
    segQ.set(arm.hand, fore.clone().slerp(handQ, c.k));
  }

  dispose() {
    this.body.geometry.dispose();
    this.shorts.geometry.dispose();
    this.skin.dispose();
    this.shortsMat.dispose();
  }
}
