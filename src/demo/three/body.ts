import { BufferGeometry, Color, Group, LatheGeometry, Matrix4, Mesh, MeshStandardMaterial, SphereGeometry, Vector2, Vector3 } from 'three';
import type { FocusGroup, Joints, Vec } from '../types';

// A smooth display mannequin: every part is a closed, rounded solid of revolution
// sized in centimetres, and neighbouring parts overlap so no joint ball shows.

export const HIP_Z = 9;
export const SHOULDER_Z = 18;

/** Solid of revolution through (y, radius) control points, closed at both ends. */
function solid(points: [number, number][], segments = 24): BufferGeometry {
  const pts = [...points].sort((a, b) => a[0] - b[0]);
  const y0 = pts[0][0];
  const y1 = pts[pts.length - 1][0];
  const out: Vector2[] = [];
  const N = 44;
  // Catmull-Rom through the control points: continuous slope, so no banding in the shading.
  const rAt = (y: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ya, ra] = pts[i];
      const [yb, rb] = pts[i + 1];
      if (y >= ya && y <= yb) {
        const t = (y - ya) / (yb - ya || 1);
        const r0 = (pts[i - 1] ?? pts[i])[1];
        const r3 = (pts[i + 2] ?? pts[i + 1])[1];
        const t2 = t * t;
        const t3 = t2 * t;
        return 0.5 * (2 * ra + (-r0 + rb) * t + (2 * r0 - 5 * ra + 4 * rb - r3) * t2 + (-r0 + 3 * ra - 3 * rb + r3) * t3);
      }
    }
    return 0;
  };
  for (let i = 0; i <= N; i++) {
    // Denser sampling near the ends, where the caps close.
    const k = i / N;
    const e = 0.5 - 0.5 * Math.cos(k * Math.PI);
    const y = y0 + (y1 - y0) * (0.35 * k + 0.65 * e);
    out.push(new Vector2(Math.max(0, rAt(y)), y));
  }
  out[0].x = 0;
  out[out.length - 1].x = 0;
  return new LatheGeometry(out, segments);
}

// Profiles: y runs from the proximal joint (0) to the distal joint (segment length).
const G = {
  pelvis: solid([[-14, 0], [-13, 6], [-9, 12.5], [-3, 15.2], [3, 15.4], [10, 13.2], [17, 12.2], [24, 12.6], [28, 0]]),
  chest: solid([[-6, 0], [-5, 11.5], [2, 13.4], [10, 15.6], [17, 16.8], [23, 16.2], [27, 13], [30, 8.5], [32, 0]]),
  glute: new SphereGeometry(1, 20, 14),
  neck: solid([[-6, 0], [-5, 6.2], [0, 6], [6, 5.4], [11, 5.6], [13, 0]], 20),
  head: new SphereGeometry(1, 28, 20),
  jaw: new SphereGeometry(1, 20, 14),
  deltoid: new SphereGeometry(1, 20, 14),
  thigh: solid([[-7, 0], [-6, 6.5], [0, 8.8], [7, 9.4], [18, 8.6], [31, 7], [41, 5.8], [46, 4.4], [48, 0]]),
  shin: solid([[-5, 0], [-4, 4.8], [2, 5.6], [9, 6.4], [17, 5.9], [29, 4.2], [38, 3.4], [42, 3.2], [44, 0]]),
  upperArm: solid([[-5, 0], [-4, 4.6], [3, 5.3], [11, 4.9], [21, 4.2], [28, 3.8], [31, 0]], 28),
  forearm: solid([[-4, 0], [-3, 3.7], [4, 4.3], [11, 3.7], [18, 2.9], [21, 2.5], [23, 0]], 28),
  hand: new SphereGeometry(1, 16, 12),
  thumb: new SphereGeometry(1, 16, 12),
  foot: new SphereGeometry(1, 20, 14),
  heel: new SphereGeometry(1, 20, 14),
};

type Part = { mesh: Mesh; group: FocusGroup | 'body' };

export class Body {
  root = new Group();
  private skin = new MeshStandardMaterial({ color: '#ecebef', roughness: 0.52, metalness: 0.0 });
  private focusMat = new MeshStandardMaterial({ color: '#b8f23f', roughness: 0.46, metalness: 0.0, emissive: new Color('#1a2900') });
  private parts: Record<string, Part> = {};

  constructor() {
    const add = (name: string, geo: BufferGeometry, group: FocusGroup | 'body') => {
      const m = new Mesh(geo, this.skin);
      m.castShadow = true;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      this.root.add(m);
      this.parts[name] = { mesh: m, group };
    };
    for (const s of ['N', 'F']) {
      add('thigh' + s, G.thigh, 'legs');
      add('shin' + s, G.shin, 'legs');
      add('foot' + s, G.foot, 'legs');
      add('heel' + s, G.heel, 'legs');
      add('glute' + s, G.glute, 'legs');
      add('upperArm' + s, G.upperArm, 'arms');
      add('deltoid' + s, G.deltoid, 'arms');
      add('forearm' + s, G.forearm, 'arms');
      add('hand' + s, G.hand, 'arms');
      add('thumb' + s, G.thumb, 'arms');
    }
    add('pelvis', G.pelvis, 'core');
    add('chest', G.chest, 'back');
    add('neck', G.neck, 'body');
    add('head', G.head, 'body');
    add('jaw', G.jaw, 'body');
  }

  setFocus(focus: FocusGroup[]) {
    const f = new Set(focus);
    const trunk = f.has('core') || f.has('back');
    for (const [name, p] of Object.entries(this.parts)) {
      const lit = p.group !== 'body' && (f.has(p.group as FocusGroup) || ((name === 'chest' || name === 'pelvis') && trunk));
      p.mesh.material = lit ? this.focusMat : this.skin;
    }
  }

  dispose() {
    this.skin.dispose();
    this.focusMat.dispose();
  }

  /** Local frame for a part: y along `up`, z across the body, x front-to-back. */
  private frame(up: Vector3, front: boolean) {
    const u = up.clone().normalize();
    let L = front ? new Vector3().crossVectors(new Vector3(0, 0, 1), u) : new Vector3(0, 0, 1);
    if (L.lengthSq() < 1e-6) L = new Vector3(1, 0, 0);
    L.normalize();
    const D = new Vector3().crossVectors(u, L).normalize();
    L = new Vector3().crossVectors(D, u).normalize();
    return { u, L, D };
  }

  /** Place a part at `origin`, oriented along `up`, scaled (depth, length, width). */
  private put(name: string, origin: Vector3, up: Vector3, front: boolean, dep: number, len: number, lat: number) {
    const { u, L, D } = this.frame(up, front);
    const m = this.parts[name].mesh;
    m.matrix.copy(new Matrix4().makeBasis(D.multiplyScalar(dep), u.multiplyScalar(len), L.multiplyScalar(lat)).setPosition(origin));
    m.matrixWorldNeedsUpdate = true;
  }

  /** A limb solid from a to b, with its profile drawn for `nominal` cm of length. */
  private limb(name: string, a: Vector3, b: Vector3, front: boolean, nominal: number, thick = 1) {
    const len = Math.max(0.1, a.distanceTo(b));
    this.put(name, a, b.clone().sub(a), front, thick, len / nominal, thick);
  }

  pose(j: Joints, front: boolean) {
    const V = (v: Vec, z = 0) => new Vector3(v[0], v[1], z);
    const hz = front ? 0 : HIP_Z;
    const sz = front ? 0 : SHOULDER_Z;
    // Front view: the rig spreads shoulders by 17 cm; push the arms out to clear the chest.
    const spread = (v: Vec, sign: number): Vec => (front ? [v[0] + sign * 2, v[1]] : v);

    const pelvis = V(j.pelvis);
    const mid = V(j.mid);
    const shoulder = V(j.shoulder);
    const head = V(j.headC);
    const lowUp = mid.clone().sub(pelvis);
    const upUp = shoulder.clone().sub(mid);
    const { D: back } = this.frame(lowUp, front);

    this.put('pelvis', pelvis, lowUp, front, 0.7, lowUp.length() / 24, 1);
    this.put('chest', mid, upUp, front, 0.66, upUp.length() / 25, 1);
    const neckDir = head.clone().sub(shoulder).normalize();
    this.put('neck', shoulder.clone().addScaledVector(neckDir, 1), neckDir, front, 1, 1, 1);
    const { D: face } = this.frame(neckDir, front);
    this.put('head', head, neckDir, front, 9.4, 11.6, 8.6);
    // Jaw sits forward and below the skull centre (the figure faces +x in side view).
    const fwd = front ? new Vector3(0, 0, 1) : face.clone();
    this.put('jaw', head.clone().addScaledVector(neckDir, -4.2).addScaledVector(fwd, 1.6), neckDir, front, 6.8, 6.4, 6.4);

    for (const s of ['N', 'F'] as const) {
      const sign = s === 'N' ? 1 : -1;
      const z = sign * hz;
      const hip = V(s === 'N' ? j.hipN : j.hipF, z);
      const knee = V(s === 'N' ? j.kneeN : j.kneeF, z);
      const ankle = V(s === 'N' ? j.ankleN : j.ankleF, z);
      const heel = V(s === 'N' ? j.heelN : j.heelF, z);
      const toe = V(s === 'N' ? j.toeN : j.toeF, z);
      this.limb('thigh' + s, hip, knee, front, 44);
      this.limb('shin' + s, knee, ankle, front, 42);
      const fdir = toe.clone().sub(heel);
      const fmid = heel.clone().lerp(toe, 0.55);
      this.put('foot' + s, fmid.clone().add(new Vector3(0, 1.2, 0)), fdir, front, 3.2, fdir.length() * 0.56, 4.4);
      this.put('heel' + s, heel.clone().lerp(toe, 0.12).add(new Vector3(0, 2.4, 0)), fdir, front, 3.8, 4.4, 3.8);
      // Glutes: behind and below the hip joint.
      const g = hip.clone().addScaledVector(back, front ? 0 : -4.2).addScaledVector(lowUp.clone().normalize(), -2.5);
      if (front) g.add(new Vector3(0, 0, -5));
      this.put('glute' + s, g, lowUp, front, 7.2, 8.8, 7.8);

      const sh = V(spread(s === 'N' ? j.shN : j.shF, sign), sign * sz);
      const el = V(spread(s === 'N' ? j.elbowN : j.elbowF, sign), sign * sz);
      const wr = V(spread(s === 'N' ? j.wristN : j.wristF, sign), sign * sz);
      this.limb('upperArm' + s, sh, el, front, 30);
      const adir = el.clone().sub(sh).normalize();
      this.put('deltoid' + s, sh.clone().addScaledVector(adir, 3), adir, front, 5.2, 6.6, 5.4);
      // Forearm ends at the wrist; the hand fills the last few centimetres of the rig segment.
      const hdir = wr.clone().sub(el).normalize();
      const wristPt = wr.clone().addScaledVector(hdir, -7);
      this.limb('forearm' + s, el, wristPt, front, 21);
      this.put('hand' + s, wr.clone().addScaledVector(hdir, -2.5), hdir, front, 2.3, 5.2, 4.3);
      this.put('thumb' + s, wr.clone().addScaledVector(hdir, -4.5).add(new Vector3(0, 0, front ? 0 : sign * -3.2)), hdir, front, 1.4, 2.8, 1.5);
    }
  }
}
