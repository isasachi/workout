import {
  ACESFilmicToneMapping, BoxGeometry, CanvasTexture, Color, CylinderGeometry, DirectionalLight, Fog, Group,
  HemisphereLight, Mesh, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, Scene, SphereGeometry, SRGBColorSpace, Vector3, WebGLRenderer,
  type Object3D,
} from 'three';
import { DEMO_ASPECT } from '../frame';
import { Body, SHOULDER_Z } from './body';
import { solve } from '../rig';
import type { Joints, Move, Prop, Vec } from '../types';

// World units are centimetres. The 2D rig lives in the x/y plane; side-view
// limbs get depth on z so the body has volume and the light can model it.

const C = {
  bg: '#111113',
  floor: '#1a1a1d',
  skin: '#e7e7ec',
  focus: '#b8f23f',
  prop: '#303036',
  propDark: '#232327',
  towel: '#d2d2d8',
  pack: '#3a8fd1',
  mat: '#24242a',
};

const box = (w: number, h: number, d: number, mat: MeshStandardMaterial | MeshLambertMaterial, x: number, y: number, z: number) => {
  const m = new Mesh(new BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
};

function buildProp(p: Prop, mats: { prop: MeshStandardMaterial; dark: MeshStandardMaterial; mat: MeshStandardMaterial | MeshLambertMaterial; pack: MeshStandardMaterial }, front: boolean): Object3D {
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
    mat: new MeshLambertMaterial({ color: C.mat }),
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
    const rim = new DirectionalLight('#eef2ff', 5.5);
    rim.position.set(-220, 150, -260);
    const rim2 = new DirectionalLight('#f4f6ff', 3.2);
    rim2.position.set(240, 220, -200);
    this.scene.add(rim, rim2);
    const bounce = new DirectionalLight('#ffffff', 0.35);
    bounce.position.set(60, -80, 160);
    this.scene.add(bounce);

    // Matte floor: no specular sheen from the backlights at grazing angles.
    const floor = new Mesh(new PlaneGeometry(3000, 3000), new MeshLambertMaterial({ color: C.floor }));
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
        const knob = new Mesh(new SphereGeometry(1, 20, 14), this.mats.prop);
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
