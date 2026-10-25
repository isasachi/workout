import {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, Color, MeshBasicMaterial, CylinderGeometry, DirectionalLight, Fog, Group,
  HemisphereLight, LatheGeometry, Matrix4, Mesh, MeshStandardMaterial, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, SRGBColorSpace, Vector2, Vector3,
  WebGLRenderer, type BufferGeometry, type Object3D,
} from 'three';
import { DEMO_ASPECT } from '../frame';
import { solve } from '../rig';
import type { FocusGroup, Joints, Move, Prop, Vec } from '../types';

// World units are centimetres. The 2D rig lives in the x/y plane; side-view
// limbs get depth on z so the body has volume and the light can model it.
const HIP_Z = 9;
const SHOULDER_Z = 15;

const C = {
  bg: '#111113',
  floor: '#161618',
  skin: '#e7e7ec',
  focus: '#b8f23f',
  prop: '#303036',
  propDark: '#232327',
  towel: '#d2d2d8',
  pack: '#3a8fd1',
  mat: '#24242a',
};

const lathe = (profile: [number, number][]) =>
  new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), 28);

// Muscle profiles: radius in cm along the normalised length of each segment.
const GEO = {
  thigh: lathe([[0.1, 0], [7.4, 0.02], [8.6, 0.16], [8.1, 0.48], [6.4, 0.86], [5.6, 1]]),
  shin: lathe([[5.5, 0], [6.4, 0.2], [5.7, 0.5], [4.1, 0.86], [3.6, 1]]),
  upperArm: lathe([[4.8, 0], [5.2, 0.24], [4.5, 0.66], [3.8, 1]]),
  forearm: lathe([[3.8, 0], [4.3, 0.18], [3.5, 0.7], [2.7, 1]]),
  abdomen: lathe([[10.2, 0], [8.7, 0.5], [9.2, 1]]),
  chest: lathe([[9.2, 0], [10.4, 0.28], [11.4, 0.6], [11.2, 0.84], [9.6, 0.96], [5, 1]]),
  neck: new CylinderGeometry(5.0, 5.8, 1, 20),
  sphere: new SphereGeometry(1, 32, 24),
};
// Lathe and cylinder geometry run along +y from 0 to 1 (cylinders are centred, so shift them).
GEO.neck.translate(0, 0.5, 0);

type Side = 'N' | 'F';

class Body {
  root = new Group();
  private skin: MeshStandardMaterial;
  private focusMat: MeshStandardMaterial;
  private parts: Record<string, Mesh> = {};
  private groups: Record<string, FocusGroup | 'body'> = {};

  constructor() {
    this.skin = new MeshStandardMaterial({ color: C.skin, roughness: 0.46, metalness: 0.02 });
    this.focusMat = new MeshStandardMaterial({ color: C.focus, roughness: 0.42, metalness: 0.02, emissive: new Color('#1d2c00') });
    const add = (name: string, geo: BufferGeometry, group: FocusGroup | 'body') => {
      const m = new Mesh(geo, this.skin);
      m.castShadow = true;
      m.receiveShadow = true;
      m.matrixAutoUpdate = false;
      this.root.add(m);
      this.parts[name] = m;
      this.groups[name] = group;
    };
    for (const s of ['N', 'F'] as Side[]) {
      add('thigh' + s, GEO.thigh, 'legs');
      add('shin' + s, GEO.shin, 'legs');
      add('knee' + s, GEO.sphere, 'legs');
      add('ankle' + s, GEO.sphere, 'legs');
      add('foot' + s, GEO.sphere, 'legs');
      add('hip' + s, GEO.sphere, 'legs');
      add('upperArm' + s, GEO.upperArm, 'arms');
      add('forearm' + s, GEO.forearm, 'arms');
      add('shoulder' + s, GEO.sphere, 'arms');
      add('elbow' + s, GEO.sphere, 'arms');
      add('hand' + s, GEO.sphere, 'arms');
    }
    add('pelvis', GEO.sphere, 'core');
    add('abdomen', GEO.abdomen, 'core');
    add('chest', GEO.chest, 'back');
    add('neck', GEO.neck, 'body');
    add('head', GEO.sphere, 'body');
  }

  setFocus(focus: FocusGroup[]) {
    const f = new Set(focus);
    for (const [name, mesh] of Object.entries(this.parts)) {
      const g = this.groups[name];
      const lit = g !== 'body' && (f.has(g as FocusGroup) || ((name === 'chest' || name === 'abdomen' || name === 'pelvis') && (f.has('core') || f.has('back'))));
      mesh.material = lit ? this.focusMat : this.skin;
    }
  }

  dispose() {
    this.skin.dispose();
    this.focusMat.dispose();
  }

  /**
   * Places a mesh along a→b. Local y follows the segment; `lat` and `dep` scale
   * the width across the body and the depth front-to-back.
   */
  private seg(name: string, a: Vector3, b: Vector3, front: boolean, lat = 1, dep = 1, extend = 0) {
    const m = this.parts[name];
    const up = b.clone().sub(a);
    let len = up.length();
    if (len < 1e-4) {
      up.set(0, 1, 0);
      len = 1e-4;
    }
    up.divideScalar(len);
    const start = extend ? a.clone().addScaledVector(up, -extend) : a;
    len += extend * 2;
    let L: Vector3;
    let D: Vector3;
    if (front) {
      D = new Vector3(0, 0, 1);
      L = new Vector3().crossVectors(D, up).normalize();
      if (L.lengthSq() < 1e-6) L.set(1, 0, 0);
      D = new Vector3().crossVectors(up, L).normalize();
    } else {
      L = new Vector3(0, 0, 1);
      D = new Vector3().crossVectors(up, L).normalize();
      if (D.lengthSq() < 1e-6) D.set(1, 0, 0);
    }
    const basis = new Matrix4().makeBasis(D.multiplyScalar(dep), up.multiplyScalar(len), L.multiplyScalar(lat));
    basis.setPosition(start);
    m.matrix.copy(basis);
    m.matrixWorldNeedsUpdate = true;
  }

  private ball(name: string, p: Vector3, r: number, sx = 1, sy = 1, sz = 1) {
    const m = this.parts[name];
    m.matrix.makeScale(r * sx, r * sy, r * sz).setPosition(p);
    m.matrixWorldNeedsUpdate = true;
  }

  /** Ellipsoid along a→b, `w` across the body, `t` thick. */
  private pod(name: string, a: Vector3, b: Vector3, front: boolean, w: number, t: number) {
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const half = Math.max(0.5, a.distanceTo(b) / 2);
    this.parts[name].matrix.copy(this.basisAt(mid, b.clone().sub(a), front, t, half, w));
    this.parts[name].matrixWorldNeedsUpdate = true;
  }

  pose(j: Joints, front: boolean) {
    const V = (v: Vec, z = 0) => new Vector3(v[0], v[1], z);
    const zN = front ? 0 : HIP_Z;
    const zF = front ? 0 : -HIP_Z;
    const sN = front ? 0 : SHOULDER_Z;
    const sF = front ? 0 : -SHOULDER_Z;

    for (const s of ['N', 'F'] as Side[]) {
      const z = s === 'N' ? zN : zF;
      const sz = s === 'N' ? sN : sF;
      const hip = V(s === 'N' ? j.hipN : j.hipF, z);
      const knee = V(s === 'N' ? j.kneeN : j.kneeF, z);
      const ankle = V(s === 'N' ? j.ankleN : j.ankleF, z);
      const heel = V(s === 'N' ? j.heelN : j.heelF, z);
      const toe = V(s === 'N' ? j.toeN : j.toeF, z);
      const sh = V(s === 'N' ? j.shN : j.shF, sz);
      const el = V(s === 'N' ? j.elbowN : j.elbowF, sz);
      const wr = V(s === 'N' ? j.wristN : j.wristF, sz);

      this.seg('thigh' + s, hip, knee, front);
      this.seg('shin' + s, knee, ankle, front);
      this.ball('hip' + s, hip, 7.6);
      this.ball('knee' + s, knee, 5.7);
      this.ball('ankle' + s, ankle, 3.7);
      this.pod('foot' + s, heel, toe, front, 4.4, 3.2);
      this.seg('upperArm' + s, sh, el, front);
      this.seg('forearm' + s, el, wr, front);
      this.ball('shoulder' + s, sh, 6.2);
      this.ball('elbow' + s, el, 3.9);
      const fdir = wr.clone().sub(el).normalize();
      this.pod('hand' + s, wr.clone().addScaledVector(fdir, 0.5), wr.clone().addScaledVector(fdir, 8.5), front, 3.1, 2.3);
    }

    const pelvis = V(j.pelvis);
    const mid = V(j.mid);
    const shoulder = V(j.shoulder);
    const head = V(j.headC);
    const lat = front ? 1.5 : 1.62;
    this.pod('pelvis', pelvis.clone().addScaledVector(mid.clone().sub(pelvis).normalize(), -7), pelvis.clone().addScaledVector(mid.clone().sub(pelvis).normalize(), 9), front, 14.5, 9.5);
    this.seg('abdomen', pelvis, mid, front, lat, 1.0);
    this.seg('chest', mid, shoulder, front, lat, 1.02, 1.5);
    const neckBase = shoulder.clone().addScaledVector(head.clone().sub(shoulder).normalize(), -2);
    const neckTop = shoulder.clone().addScaledVector(head.clone().sub(shoulder).normalize(), 10);
    this.seg('neck', neckBase, neckTop, front);
    const hd = head.clone().sub(shoulder).normalize();
    this.parts.head.matrix.copy(this.basisAt(head, hd, front, 9.6, 11.4, 9.0));
    this.parts.head.matrixWorldNeedsUpdate = true;
  }

  private basisAt(p: Vector3, up: Vector3, front: boolean, dep: number, len: number, lat: number) {
    const u = up.clone().normalize();
    let L = front ? new Vector3().crossVectors(new Vector3(0, 0, 1), u).normalize() : new Vector3(0, 0, 1);
    if (L.lengthSq() < 1e-6) L = new Vector3(1, 0, 0);
    const D = new Vector3().crossVectors(u, L).normalize();
    return new Matrix4().makeBasis(D.multiplyScalar(dep), u.multiplyScalar(len), L.multiplyScalar(lat)).setPosition(p);
  }
}

const box = (w: number, h: number, d: number, mat: MeshStandardMaterial, x: number, y: number, z: number) => {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

function buildProp(p: Prop, mats: { prop: MeshStandardMaterial; dark: MeshStandardMaterial; mat: MeshStandardMaterial; pack: MeshStandardMaterial }, front: boolean): Object3D {
  const g = new Group();
  const x = p.x ?? 0;
  const s = p.flip ? -1 : 1;
  switch (p.kind) {
    case 'chair':
    case 'chairBehind': {
      const z = p.kind === 'chairBehind' ? -24 : 0;
      g.add(box(42, 4, 40, mats.prop, x + 20 * s, 46, z));
      g.add(box(4, 52, 40, mats.prop, x, 72, z));
      for (const dx of [2, 38]) for (const dz of [-17, 17]) g.add(box(3, 44, 3, mats.dark, x + dx * s, 22, z + dz));
      break;
    }
    case 'wallFront':
      g.add(box(14, 230, 140, mats.dark, x + 7, 115, -46));
      break;
    case 'wallBehind':
      g.add(box(240, 200, 4, mats.dark, x, 100, front ? -16 : -22));
      break;
    case 'counter':
      g.add(box(74, 6, 64, mats.prop, x + 35, 89, 0));
      g.add(box(62, 86, 58, mats.dark, x + 40, 43, 0));
      break;
    case 'step':
      g.add(box(56, 20, 64, mats.prop, x + 28, 10, 0));
      break;
    case 'door':
      g.add(box(8, 210, 86, mats.dark, x + 4, 105, -30));
      break;
    case 'mat':
      g.add(box(200, 1.4, 66, mats.mat, x, 0.7, 0));
      break;
  }
  return g;
}

export class FigureScene {
  renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(26, DEMO_ASPECT, 10, 4000);
  private body = new Body();
  private props = new Group();
  private dynamic: { towelN?: Mesh; towelF?: Mesh; knob?: Vector3; packHands?: Mesh; packBack?: Mesh } = {};
  private key: DirectionalLight;
  private move: Move | null = null;
  private mats = {
    prop: new MeshStandardMaterial({ color: C.prop, roughness: 0.72 }),
    dark: new MeshStandardMaterial({ color: C.propDark, roughness: 0.85 }),
    mat: new MeshStandardMaterial({ color: C.mat, roughness: 0.95 }),
    pack: new MeshStandardMaterial({ color: C.pack, roughness: 0.6 }),
    towel: new MeshStandardMaterial({ color: C.towel, roughness: 0.9 }),
  };

  private blobs: Mesh[] = [];

  constructor(canvas?: HTMLCanvasElement, opts: { preserve?: boolean } = {}) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: !!opts.preserve, powerPreference: 'low-power' });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setClearColor(C.bg);

    this.scene.background = new Color(C.bg);
    this.scene.fog = new Fog(C.bg, 520, 1100);

    const hemi = new HemisphereLight('#ffffff', '#1a1a1c', 1.0);
    this.scene.add(hemi);
    this.key = new DirectionalLight('#ffffff', 2.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.radius = 6;
    this.key.shadow.bias = -0.0006;
    this.key.shadow.normalBias = 0.6;
    this.scene.add(this.key, this.key.target);
    // Rim from behind, slightly cool, to cut the silhouette away from the floor.
    const rim = new DirectionalLight('#eef2ff', 3.2);
    rim.position.set(-180, 110, -240);
    this.scene.add(rim);
    const bounce = new DirectionalLight('#ffffff', 0.35);
    bounce.position.set(60, -80, 160);
    this.scene.add(bounce);

    const floor = new Mesh(new PlaneGeometry(3000, 3000), new MeshStandardMaterial({ color: C.floor, roughness: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor, this.body.root, this.props);

    // Contact shadows: soft dark blobs where the body meets the floor.
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.32)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new CanvasTexture(c);
    for (let i = 0; i < 5; i++) {
      const b = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
      b.rotation.x = -Math.PI / 2;
      b.renderOrder = 1;
      this.blobs.push(b);
      this.scene.add(b);
    }
  }

  setMove(move: Move, opts: { tight?: boolean } = {}) {
    this.move = move;
    const front = move.view === 'front';
    this.body.setFocus(move.focus ?? []);
    for (const c of [...this.props.children]) {
      this.props.remove(c);
      c.traverse((o) => (o as Mesh).geometry?.dispose());
    }
    this.dynamic = {};
    for (const p of move.props ?? []) {
      if (p.kind === 'backpackHands' || p.kind === 'backpackBack') {
        const m = new Mesh(new BoxGeometry(1, 1, 1), this.mats.pack);
        m.castShadow = true;
        m.matrixAutoUpdate = false;
        this.props.add(m);
        if (p.kind === 'backpackHands') this.dynamic.packHands = m;
        else this.dynamic.packBack = m;
        continue;
      }
      this.props.add(buildProp(p, this.mats, front));
      if (p.kind === 'door') {
        const x = p.x ?? 0;
        this.dynamic.knob = new Vector3(x - 4, 95, 0);
        const knob = new Mesh(GEO.sphere, this.mats.prop);
        knob.scale.setScalar(3.2);
        knob.position.copy(this.dynamic.knob);
        this.props.add(knob);
        for (const k of ['towelN', 'towelF'] as const) {
          const t = new Mesh(new CylinderGeometry(2.2, 2.2, 1, 10).translate(0, 0.5, 0), this.mats.towel);
          t.castShadow = true;
          t.matrixAutoUpdate = false;
          this.props.add(t);
          this.dynamic[k] = t;
        }
      }
    }

    // Camera: a three-quarter view framed on everything the move reaches.
    let minX = Infinity, maxX = -Infinity, minY = 0, maxY = -Infinity;
    for (const k of move.keys) {
      const j = solve(k.pose, move.view);
      for (const v of Object.values(j)) {
        minX = Math.min(minX, v[0]);
        maxX = Math.max(maxX, v[0]);
        maxY = Math.max(maxY, v[1]);
      }
    }
    maxY += 12; // head radius
    minX -= 14;
    maxX += 14;
    const low = maxY < 90;
    // The top fifth of the stage stays clear for the player controls (not needed on thumbnails).
    const headroom = opts.tight ? 1.06 : 1.32;
    const fw = Math.max((maxX - minX) * (opts.tight ? 1.04 : 1.16), (maxY - minY) * headroom * DEMO_ASPECT, opts.tight ? 110 : 150);
    const fh = fw / DEMO_ASPECT;
    // Figures sit low in the frame so the floor reads as ground and the top corner stays free.
    const bottom = minY - fh * 0.04;
    const center = new Vector3((minX + maxX) / 2, low ? (minY + maxY) / 2 + fh * 0.12 : Math.max(bottom + fh / 2, fh * 0.4), 0);
    const theta = ((front ? 16 : 32) * Math.PI) / 180;
    const phi = ((low ? 20 : 10) * Math.PI) / 180;
    const fov = (this.camera.fov * Math.PI) / 180;
    const dist = (fh / 2 / Math.tan(fov / 2)) * 1.02;
    this.camera.position.set(center.x + Math.sin(theta) * Math.cos(phi) * dist, center.y + Math.sin(phi) * dist, Math.cos(theta) * Math.cos(phi) * dist);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
    // Studio cove: the floor fades into the background well before the horizon.
    this.scene.fog = new Fog(C.bg, dist * 0.92, dist * 1.75);

    this.key.position.set(center.x + 120, 260, 200);
    this.key.target.position.copy(center).setY(0);
    const sc = this.key.shadow.camera;
    const r = Math.max(fw, fh) * 0.75;
    sc.left = -r;
    sc.right = r;
    sc.top = r;
    sc.bottom = -r;
    sc.near = 10;
    sc.far = 900;
    sc.updateProjectionMatrix();
  }

  setPose(j: Joints) {
    const front = this.move?.view === 'front';
    this.body.pose(j, front);
    // Blobs fade as the touching point leaves the floor.
    const spots: [Vec, number, number][] = [
      [j.ankleN, front ? 0 : 9, 26],
      [j.ankleF, front ? 0 : -9, 26],
      [j.pelvis, 0, 44],
      [j.wristN, front ? 0 : 15, 18],
      [j.wristF, front ? 0 : -15, 18],
    ];
    spots.forEach(([p, z, size], i) => {
      const b = this.blobs[i];
      const k = Math.max(0, 1 - Math.max(0, p[1]) / 40); // 1 on the floor, 0 at 40 cm up
      b.visible = k > 0.02;
      b.position.set(p[0], 0.4, z);
      b.scale.setScalar(size * (0.8 + (1 - k) * 0.5));
      (b.material as MeshBasicMaterial).opacity = k;
    });
    const zN = front ? 0 : SHOULDER_Z;
    const zF = front ? 0 : -SHOULDER_Z;
    const { towelN, towelF, knob, packHands, packBack } = this.dynamic;
    const place = (m: Mesh, a: Vector3, b: Vector3) => {
      const d = b.clone().sub(a);
      const len = d.length() || 1e-4;
      const up = d.divideScalar(len);
      const L = Math.abs(up.z) > 0.9 ? new Vector3(1, 0, 0) : new Vector3(0, 0, 1);
      const D = new Vector3().crossVectors(up, L).normalize();
      const L2 = new Vector3().crossVectors(D, up).normalize();
      m.matrix.makeBasis(D, up.multiplyScalar(len), L2).setPosition(a);
      m.matrixWorldNeedsUpdate = true;
    };
    if (towelN && knob) place(towelN, knob, new Vector3(j.wristN[0], j.wristN[1], zN));
    if (towelF && knob) place(towelF, knob, new Vector3(j.wristF[0], j.wristF[1], zF));
    if (packHands) {
      packHands.matrix.makeScale(18, 26, 11).setPosition(j.wristN[0], j.wristN[1] - 14, zN);
      packHands.matrixWorldNeedsUpdate = true;
    }
    if (packBack) {
      const u = new Vector3(j.shoulder[0] - j.mid[0], j.shoulder[1] - j.mid[1], 0).normalize();
      const n = new Vector3(-u.y, u.x, 0);
      const c = new Vector3(j.mid[0], j.mid[1], 0).addScaledVector(u, 12).addScaledVector(n, 14);
      const D = n.clone();
      packBack.matrix.makeBasis(D.multiplyScalar(12), u.clone().multiplyScalar(30), new Vector3(0, 0, 26)).setPosition(c);
      packBack.matrixWorldNeedsUpdate = true;
    }
  }

  setSize(w: number, h: number, dpr: number) {
    this.renderer.setPixelRatio(Math.min(dpr, 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.body.dispose();
    for (const m of Object.values(this.mats)) m.dispose();
    this.renderer.dispose();
  }
}
