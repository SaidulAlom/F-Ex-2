/**
 * PhoneFlyer — a single procedural 3D handset on a transparent canvas, driven
 * entirely from outside.
 *
 * Purpose: the hero's flying object. It is deliberately NOT a full studio scene
 * (that lives in `phone-three.ts`): no cove, no bokeh field, no glow body — the
 * page behind it is the environment. The component that owns the scroll maths
 * hands it a position, a size and a little attitude (yaw / pitch / roll).
 *
 * Same rules as the studio build: no `three/examples` addons, no shadows, no
 * post-processing, and the canvas context is never force-lost so a StrictMode
 * remount can reuse it.
 */
import * as THREE from 'three';

export type FlyerOptions = {
  canvas: HTMLCanvasElement;
  ink: string;
  bone: string;
  accent: string;
  accentSecondary: string;
  plum?: string;
  brand?: string;
  lowDetail?: boolean;
  dprCap: number;
};

export type FlyerState = {
  /** World-space offsets, already scaled by the caller to viewport units. */
  x: number;
  y: number;
  /** World size of the handset (its longest side). */
  scale: number;
  /** Degrees. 0 = facing camera, ±90 = edge-on. */
  yaw: number;
  pitch: number;
  roll: number;
  time: number;
};

export type FlyerHandle = {
  render: (state: FlyerState) => void;
  resize: (cssWidth: number, cssHeight: number, dpr: number) => void;
  dispose: () => void;
};

const BODY = { w: 1.0, h: 2.06, r: 0.2, t: 0.17 };
const BEVEL = 0.012;
/** Front face of the frame: the bevel sits *outside* the plate depth. */
const FRONT_Z = BODY.t / 2 + BEVEL;

function roundedShape(w: number, h: number, r: number, seg: number): THREE.Shape {
  const s = new THREE.Shape();
  const rad = Math.min(r, Math.min(w, h) / 2);
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + rad, y);
  s.lineTo(x + w - rad, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rad);
  s.lineTo(x + w, y + h - rad);
  s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  s.lineTo(x + rad, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rad);
  s.lineTo(x, y + rad);
  s.quadraticCurveTo(x, y, x + rad, y);
  return s;
}

function bevelPlate(w: number, h: number, r: number, depth: number, bevel: number, seg: number) {
  const g = new THREE.ExtrudeGeometry(roundedShape(w, h, r, seg), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: bevel > 0 ? 2 : 0,
    curveSegments: seg,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

/** ShapeGeometry emits UVs in shape space — remap them to 0..1 or textures tile. */
function normalizeUV(geo: THREE.BufferGeometry) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv as THREE.BufferAttribute | undefined;
  if (!bb || !uv) return geo;
  const w = bb.max.x - bb.min.x || 1;
  const h = bb.max.y - bb.min.y || 1;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / w, (pos.getY(i) - bb.min.y) / h);
  }
  uv.needsUpdate = true;
  return geo;
}

function flatPlate(w: number, h: number, r: number, seg: number) {
  const g = normalizeUV(new THREE.ShapeGeometry(roundedShape(w, h, r, seg), seg));
  g.computeVertexNormals();
  return g;
}

/** Studio gradient used as the environment the metal reflects. */
function makeEnvTexture(_ink: string, _plum: string, _accent: string, _bone: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  // Mostly deep teal: dark metal stays dark. One narrow warm band gives the
  // bevel its gold glint without washing the glass lilac or bronze.
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#0d2630');
  g.addColorStop(0.34, '#15323d');
  g.addColorStop(0.5, '#20444f');
  g.addColorStop(0.68, '#0f2530');
  g.addColorStop(1, '#061219');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  // warm horizon streak (the glow the bevel catches)
  const streak = ctx.createLinearGradient(0, 108, 0, 140);
  streak.addColorStop(0, 'rgba(217,155,127,0)');
  streak.addColorStop(0.5, 'rgba(238,186,152,0.94)');
  streak.addColorStop(1, 'rgba(217,155,127,0)');
  ctx.fillStyle = streak;
  ctx.fillRect(0, 108, 512, 32);

  // a soft white key, so the top bevel has a crisp highlight to travel along
  const soft = ctx.createRadialGradient(372, 44, 4, 372, 44, 86);
  soft.addColorStop(0, 'rgba(255,250,244,0.9)');
  soft.addColorStop(1, 'rgba(255,250,244,0)');
  ctx.fillStyle = soft;
  ctx.fillRect(0, 0, 512, 150);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

/** Dark-glass lock screen: etched mark, clock, dock. Reads as a phone at a glance. */
function makeScreenTexture(bone: string, accent: string, brand: string) {
  const W = 512;
  const H = 1080;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#04101a');
  bg.addColorStop(0.46, '#071821');
  bg.addColorStop(1, '#0b2230');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // warm bloom low-left, emerald hint top-right — depth without brightness
  const bloom = ctx.createRadialGradient(W * 0.3, H * 0.78, 10, W * 0.3, H * 0.78, 420);
  bloom.addColorStop(0, 'rgba(217,155,127,0.20)');
  bloom.addColorStop(1, 'rgba(217,155,127,0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // clock
  ctx.font = '300 104px Georgia, "Times New Roman", serif';
  ctx.fillStyle = bone;
  ctx.globalAlpha = 0.82;
  ctx.fillText('9:41', W / 2, H * 0.27);
  ctx.font = '500 19px Arial, sans-serif';
  ctx.globalAlpha = 0.42;
  ctx.fillText('SATURDAY, 29 OCTOBER', W / 2, H * 0.27 + 74);

  // etched wordmark
  ctx.globalAlpha = 0.9;
  ctx.font = '500 46px Georgia, serif';
  ctx.fillStyle = accent;
  ctx.fillText(brand.toUpperCase(), W / 2, H * 0.5);
  ctx.globalAlpha = 0.32;
  ctx.font = '400 15px Arial, sans-serif';
  ctx.fillStyle = bone;
  ctx.fillText('M O B I L E   D E A L E R   ·   G U W A H A T I', W / 2, H * 0.5 + 44);

  // hairline rules either side of the mark
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = bone;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W * 0.18, H * 0.5 + 96);
  ctx.lineTo(W * 0.82, H * 0.5 + 96);
  ctx.stroke();

  // dock
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(W * (0.2 + i * 0.2), H * 0.88, 17, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? accent : bone;
    ctx.globalAlpha = i === 0 ? 0.42 : 0.16;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function createPhoneFlyer(opts: FlyerOptions): FlyerHandle | null {
  const { canvas, ink, bone, accent, accentSecondary } = opts;
  const plum = opts.plum ?? '#464858';
  const lowDetail = Boolean(opts.lowDetail);
  const seg = lowDetail ? 10 : 24;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !lowDetail, premultipliedAlpha: false });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  /* environment + lights */
  const envSrc = track(makeEnvTexture(ink, plum, accent, bone));
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromEquirectangular(envSrc);
  scene.environment = envRT.texture;
  envSrc.dispose();

  const key = new THREE.DirectionalLight(0xfff4ea, 2.2);
  key.position.set(2.6, 3.1, 3.2);
  const rim = new THREE.DirectionalLight(accentSecondary, 1.7);
  rim.position.set(-3.2, 1.1, -2.4);
  const fill = new THREE.DirectionalLight(0x9fc2d2, 0.9);
  fill.position.set(-1.6, -2.2, 2.4);
  scene.add(key, rim, fill, new THREE.AmbientLight(0x2b3d49, 0.55));

  /* the handset */
  const phone = new THREE.Group();
  scene.add(phone);

  const frameMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2b3a43').lerp(new THREE.Color(plum), 0.28),
      metalness: 0.96,
      roughness: 0.2,
      envMapIntensity: 1.3,
    })
  );
  phone.add(new THREE.Mesh(track(bevelPlate(BODY.w, BODY.h, BODY.r, BODY.t, BEVEL, seg)), frameMat));

  const screenTex = track(makeScreenTexture(bone, accent, opts.brand ?? 'F-EX'));
  const screenMat = track(
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: screenTex,
      emissiveIntensity: 0.62,
      roughness: 0.42,
      metalness: 0.04,
      // kept low: a strong env reflection turns the etched glass mauve
      envMapIntensity: 0.16,
    })
  );
  const screen = new THREE.Mesh(track(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg)), screenMat);
  screen.position.z = FRONT_Z + 0.0012;
  phone.add(screen);

  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 0.45,
      depthWrite: false,
    })
  );
  const glass = new THREE.Mesh(track(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg)), glassMat);
  glass.position.z = FRONT_Z + 0.0045;
  phone.add(glass);

  const backMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(plum).multiplyScalar(0.8),
      metalness: 0.62,
      roughness: 0.18,
      envMapIntensity: 1.5,
    })
  );
  const back = new THREE.Mesh(track(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg)), backMat);
  back.position.z = -FRONT_Z - 0.0008;
  back.rotation.y = Math.PI;
  phone.add(back);

  /* camera island */
  const islandGroup = new THREE.Group();
  islandGroup.position.set(-0.01, BODY.h / 2 - 0.36, -FRONT_Z - 0.016);
  phone.add(islandGroup);
  const islandMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(plum).multiplyScalar(0.72),
      metalness: 0.9,
      roughness: 0.2,
      envMapIntensity: 1.6,
    })
  );
  const island = new THREE.Mesh(track(bevelPlate(0.46, 0.48, 0.14, 0.05, 0.008, lowDetail ? 6 : 14)), islandMat);
  island.rotation.y = Math.PI;
  islandGroup.add(island);

  const lensRingMat = track(new THREE.MeshStandardMaterial({ color: '#101b21', metalness: 0.9, roughness: 0.35 }));
  const lensGlassMat = track(
    new THREE.MeshPhysicalMaterial({ color: '#080f13', metalness: 0.15, roughness: 0.05, clearcoat: 1, envMapIntensity: 2.2 })
  );
  const lensGeo = track(new THREE.CylinderGeometry(0.082, 0.082, 0.036, lowDetail ? 12 : 26));
  const lensGlassGeo = track(
    new THREE.SphereGeometry(0.055, lowDetail ? 10 : 20, lowDetail ? 8 : 14, 0, Math.PI * 2, 0, Math.PI / 2)
  );
  for (const [lx, ly] of [
    [-0.11, 0.12],
    [-0.11, -0.12],
    [0.11, 0],
  ] as [number, number][]) {
    const ring = new THREE.Mesh(lensGeo, lensRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(lx, ly, -0.025);
    const lens = new THREE.Mesh(lensGlassGeo, lensGlassMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(lx, ly, -0.03);
    islandGroup.add(ring, lens);
  }

  /* side keys */
  const buttonMat = track(
    new THREE.MeshStandardMaterial({ color: new THREE.Color(plum).multiplyScalar(0.7), metalness: 0.9, roughness: 0.3 })
  );
  const buttonGeo = track(new THREE.BoxGeometry(0.014, 0.14, 0.05));
  const volA = new THREE.Mesh(buttonGeo, buttonMat);
  volA.position.set(-BODY.w / 2 - 0.006, 0.42, 0);
  const volB = new THREE.Mesh(buttonGeo, buttonMat);
  volB.position.set(-BODY.w / 2 - 0.006, 0.2, 0);
  const powerGeo = track(new THREE.BoxGeometry(0.014, 0.22, 0.05));
  const power = new THREE.Mesh(powerGeo, buttonMat);
  power.position.set(BODY.w / 2 + 0.006, 0.3, 0);
  phone.add(volA, volB, power);

  const handle: FlyerHandle = {
    resize(cssWidth, cssHeight, dpr) {
      const w = Math.max(1, Math.round(cssWidth));
      const h = Math.max(1, Math.round(cssHeight));
      renderer.setPixelRatio(Math.min(dpr, opts.dprCap));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },

    render(s) {
      const d = Math.PI / 180;
      phone.position.set(s.x, s.y, 0);
      phone.scale.setScalar(s.scale);
      // YZX so roll stays in the phone's own plane while pitch tips the nose.
      phone.rotation.set(s.roll * d, s.yaw * d, s.pitch * d, 'YZX');
      renderer.render(scene, camera);
    },

    dispose() {
      for (const x of disposables) {
        try {
          x.dispose();
        } catch {
          /* ignore */
        }
      }
      envRT.dispose();
      pmrem.dispose();
      frameMat.dispose();
      screenMat.dispose();
      glassMat.dispose();
      backMat.dispose();
      islandMat.dispose();
      lensRingMat.dispose();
      lensGlassMat.dispose();
      buttonMat.dispose();
      // no forceContextLoss(): a StrictMode remount reuses this canvas
      renderer.dispose();
    },
  };

  handle.resize(canvas.clientWidth || 800, canvas.clientHeight || 600, opts.dprCap);
  return handle;
}
