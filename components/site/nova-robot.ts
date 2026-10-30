/**
 * The F-Ex counter robot — a boxy white-ceramic desk robot, built entirely from
 * three.js primitives. No models, no textures from disk: the gradient ring on the
 * face frame and the face screen are both painted into canvases at runtime.
 *
 * Loaded dynamically by `nova-hero.tsx` so three.js never lands in the initial
 * home bundle. The camera walks two states only (intro → product), because the
 * paper hero owns the first two panels of the home page.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type FaceMode = 'eyes' | 'quote';

export type RobotApi = {
  setProgress: (p: number) => void;
  setPointer: (x: number, y: number) => void;
  setFace: (mode: FaceMode) => void;
  resize: () => void;
  dispose: () => void;
};

type CamState = {
  z: number;
  y: number;
  x: number;
  lookY: number;
  yaw: number;
  headYaw: number;
  headPitch: number;
  headRoll: number;
};

const INTRO: CamState = { z: 15.4, y: 1.7, x: -0.3, lookY: 0.15, yaw: -0.42, headYaw: -0.34, headPitch: 0.12, headRoll: 0.15 };
const PRODUCT: CamState = { z: 8.8, y: 2.05, x: -0.66, lookY: 1.68, yaw: -0.2, headYaw: -0.06, headPitch: 0.04, headRoll: 0 };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ------------------------------------------------------------------ */
/* textures painted in code                                            */
/* ------------------------------------------------------------------ */

function ringTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createConicGradient ? ctx.createConicGradient(-Math.PI / 2, 256, 256) : null;

  if (grad) {
    grad.addColorStop(0.0, '#ff3d8b');
    grad.addColorStop(0.14, '#ff5a5f');
    grad.addColorStop(0.3, '#ff8a3d');
    grad.addColorStop(0.43, '#ffb347');
    grad.addColorStop(0.57, '#ff8a3d');
    grad.addColorStop(0.72, '#ff5a5f');
    grad.addColorStop(1.0, '#ff3d8b');
    ctx.fillStyle = grad;
  } else {
    const lin = ctx.createLinearGradient(0, 0, 512, 512);
    lin.addColorStop(0, '#ff3d8b');
    lin.addColorStop(0.5, '#ff8a3d');
    lin.addColorStop(1, '#ffb347');
    ctx.fillStyle = lin;
  }
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeFace() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    draw(mode: FaceMode, blink: number, alpha: number) {
      ctx.clearRect(0, 0, 512, 512);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 512, 512);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(255,255,255,.9)';
      ctx.shadowBlur = 18;

      if (mode === 'eyes') {
        const squash = Math.max(0.08, blink);
        for (const [x, y] of [
          [196, 262],
          [316, 252],
        ]) {
          ctx.beginPath();
          ctx.ellipse(x, y, 30, 38 * squash, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.font = '560px "Arial Black", "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('\u201C', 256, 400);
      }
      ctx.restore();
      texture.needsUpdate = true;
    },
  };
}

/* ------------------------------------------------------------------ */
/* the robot                                                           */
/* ------------------------------------------------------------------ */

export function createNovaRobot(canvas: HTMLCanvasElement, opts: { still?: boolean } = {}): RobotApi | null {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  /* environment + lights */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.9;

  scene.add(new THREE.HemisphereLight(0xfff6ee, 0xd9d2c8, 0.7));

  const key = new THREE.DirectionalLight(0xfff3e6, 1.7);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -3;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xfff0e6, 1.2);
  rim.position.set(4, 2, -4);
  scene.add(rim);

  const fill = new THREE.PointLight(0xff9a6a, 2.2, 6, 2);
  fill.position.set(-3.2, 1.2, 0.6);
  scene.add(fill);

  /* materials */
  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xeeebe6,
    roughness: 0.38,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
  });
  const shellLight = new THREE.MeshPhysicalMaterial({
    color: 0xf8f6f2,
    roughness: 0.34,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
  });
  const joint = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.55, metalness: 0.3 });
  const deep = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.6, metalness: 0.2 });
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x2a2928, roughness: 0.9 });

  const ringTex = ringTexture();
  const ringMat = new THREE.MeshPhysicalMaterial({
    map: ringTex,
    emissiveMap: ringTex,
    emissive: 0xffffff,
    emissiveIntensity: 0.22,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
  });

  const face = makeFace();
  const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x050506,
    roughness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.12,
    emissive: 0xffffff,
    emissiveMap: face.texture,
    emissiveIntensity: 1.5,
    envMapIntensity: 0.45,
  });

  const box = (w: number, h: number, d: number, r = 0.04, seg = 3) =>
    new RoundedBoxGeometry(w, h, d, seg, Math.min(r, Math.min(w, h, d) / 2 - 0.001));

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number]) => {
    const m = new THREE.Mesh(geo, mat);
    if (pos) m.position.set(...pos);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  /* ---- pedestal ---- */
  add(scene, box(1.62, 1.2, 1.62, 0.05), pedestalMat, [0, -2.02, 0]);

  /* ---- body root ---- */
  const body = new THREE.Group();
  body.position.y = 0;
  scene.add(body);

  /* legs */
  for (const side of [-1, 1]) {
    add(body, new THREE.SphereGeometry(0.15, 20, 16), joint, [side * 0.33, -0.7, 0]);
    add(body, box(0.3, 0.52, 0.32, 0.1), shell, [side * 0.33, -1.0, 0]);
    add(body, new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), joint, [side * 0.33, -1.26, 0]);
    add(body, box(0.36, 0.2, 0.52, 0.08), shellLight, [side * 0.33, -1.36, 0.06]);
  }

  /* pelvis + torso */
  add(body, box(0.72, 0.3, 0.82, 0.08), joint, [0, -0.62, 0]);
  add(body, box(1.22, 1.12, 0.92, 0.24), shell, [0, -0.06, 0]);
  add(body, box(0.98, 0.16, 0.86, 0.07), shellLight, [0, 0.44, 0.02]);

  /* chest LEDs */
  const ledColors = [0xff8a3d, 0xff5a5f, 0xff3d8b];
  ledColors.forEach((c, i) => {
    const led = add(
      body,
      new THREE.SphereGeometry(0.045, 14, 12),
      new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4, roughness: 0.4 }),
      [-0.16 + i * 0.16, 0.06, 0.47]
    );
    led.castShadow = false;
  });

  /* chest slots with dark lips */
  for (const side of [-1, 1]) {
    add(body, box(0.07, 0.42, 0.04, 0.02), deep, [side * 0.42, -0.2, 0.47]);
    const lip = add(body, new THREE.TorusGeometry(0.075, 0.02, 10, 18, Math.PI), joint, [side * 0.42, 0.02, 0.47]);
    lip.rotation.set(0, 0, Math.PI);
  }

  /* neck */
  add(body, new THREE.CylinderGeometry(0.17, 0.19, 0.24, 20), joint, [0, 0.62, 0]);

  /* ---- head ---- */
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.78;
  body.add(headPivot);

  const skull = add(headPivot, box(1.5, 1.42, 1.3, 0.2), shell, [0, 0.78, 0]);

  /* dark back block + circuit bars */
  add(headPivot, box(1.28, 1.14, 0.9, 0.16), deep, [0, 0.8, -0.2]);
  const barGeo = box(0.12, 0.03, 0.03, 0.012, 2);
  for (let i = 0; i < 26; i++) {
    const bar = add(headPivot, barGeo, joint);
    const back = i % 2 === 0;
    if (back) {
      bar.position.set(
        (Math.random() - 0.5) * 1.0,
        0.78 + (Math.random() - 0.5) * 0.9,
        -0.66 - Math.random() * 0.06
      );
      bar.rotation.z = Math.random() > 0.5 ? Math.PI / 2 : 0;
    } else {
      bar.position.set(
        (Math.random() - 0.5) * 0.9,
        1.44 - Math.random() * 0.06,
        -0.5 + Math.random() * 0.7
      );
      bar.rotation.y = Math.PI / 2;
    }
    bar.scale.x = 0.6 + Math.random() * 0.9;
  }

  /* face ring — extruded frame with a hole, UVs remapped to its bounds */
  const outerShape = new THREE.Shape();
  const outerW = 1.5 / 2;
  const outerH = 1.44 / 2;
  const outerR = 0.3;
  roundedRect(outerShape, -outerW, -outerH, outerW * 2, outerH * 2, outerR);

  const hole = new THREE.Path();
  const innerW = 1.08 / 2;
  const innerH = 1.02 / 2;
  roundedRect(hole, -innerW, -innerH, innerW * 2, innerH * 2, 0.2);
  outerShape.holes.push(hole);

  const ringGeo = new THREE.ExtrudeGeometry(outerShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 12,
  });
  ringGeo.computeBoundingBox();
  {
    const bb = ringGeo.boundingBox!;
    const uv = ringGeo.attributes.uv as THREE.BufferAttribute;
    const pos = ringGeo.attributes.position as THREE.BufferAttribute;
    const spanX = bb.max.x - bb.min.x;
    const spanY = bb.max.y - bb.min.y;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (pos.getX(i) - bb.min.x) / spanX, (pos.getY(i) - bb.min.y) / spanY);
    }
    uv.needsUpdate = true;
  }
  add(headPivot, ringGeo, ringMat, [0, 0.78, 0.55]);

  /* bezel + screen */
  add(headPivot, box(1.14, 1.08, 0.08, 0.18), shellLight, [0, 0.78, 0.62]);
  add(headPivot, box(0.9, 0.84, 0.05, 0.12, 4), screenMat, [0, 0.78, 0.675]);

  /* ears + cable */
  for (const side of [-1, 1]) {
    const ear = add(headPivot, new THREE.CylinderGeometry(0.22, 0.22, 0.12, 24), shellLight, [side * 0.78, 0.78, 0]);
    ear.rotation.z = Math.PI / 2;
    const cap = add(headPivot, new THREE.CylinderGeometry(0.1, 0.1, 0.14, 20), joint, [side * 0.81, 0.78, 0]);
    cap.rotation.z = Math.PI / 2;
  }
  const cable = add(headPivot, new THREE.TorusGeometry(0.2, 0.03, 10, 28, Math.PI * 1.15), joint, [0.74, 0.44, -0.34]);
  cable.rotation.set(0.5, Math.PI / 2, -0.5);

  /* ---- arms ---- */
  const arms: THREE.Group[] = [];
  const forearms: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.76, 0.3, 0);
    shoulder.rotation.z = side * -0.16;
    body.add(shoulder);
    arms.push(shoulder);

    add(shoulder, new THREE.SphereGeometry(0.15, 20, 16), joint, [0, 0, 0]);
    add(shoulder, box(0.26, 0.5, 0.26, 0.1), shell, [side * 0.03, -0.32, 0]);
    add(shoulder, new THREE.SphereGeometry(0.12, 18, 14), joint, [side * 0.03, -0.6, 0]);

    const fore = new THREE.Group();
    fore.position.set(side * 0.03, -0.6, 0);
    fore.rotation.x = -0.35;
    shoulder.add(fore);
    forearms.push(fore);

    add(fore, box(0.2, 0.38, 0.2, 0.08), shellLight, [0, -0.22, 0]);
    add(fore, box(0.24, 0.18, 0.22, 0.07), shellLight, [0, -0.46, 0.02]);
    add(fore, box(0.08, 0.12, 0.1, 0.03), shellLight, [side * -0.05, -0.44, 0.12]);
  }

  /* ---- face state ---- */
  let faceMode: FaceMode = 'eyes';
  let faceAlpha = 1;
  let blinkT = 0;
  let nextBlink = 2.5 + Math.random() * 3;
  let blinking = false;
  face.draw('eyes', 1, 1);

  /* ---- camera / progress ---- */
  const size = { w: 1, h: 1 };
  let progress = 0;
  let smoothP = 0;
  const pointer = { x: 0, y: 0 };
  const smoothPointer = { x: 0, y: 0 };
  const lookAt = new THREE.Vector3(0, INTRO.lookY, 0);
  const target = new THREE.Vector3(0, INTRO.lookY, 0);
  const clock = new THREE.Clock();
  let t = 0;

  const resize = () => {
    const parent = canvas.parentElement;
    size.w = parent?.clientWidth || window.innerWidth;
    size.h = parent?.clientHeight || window.innerHeight;
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / Math.max(1, size.h);
    camera.updateProjectionMatrix();
  };

  const applyCamera = () => {
    const e = easeInOut(smoothP);
    const z = lerp(INTRO.z, PRODUCT.z * (size.w < 900 ? 1.34 : 1), e);
    const cx = lerp(INTRO.x, PRODUCT.x, e);
    camera.position.set(cx + smoothPointer.x * 0.25, lerp(INTRO.y, PRODUCT.y, e) - smoothPointer.y * 0.1, z);
    // on phone the copy sits under the robot, so drop the figure a little in frame
    target.set(cx, lerp(INTRO.lookY, PRODUCT.lookY, e) + (size.w < 900 ? 0.9 : 0), 0);
    lookAt.lerp(target, 1);
    camera.lookAt(lookAt);

    const yaw = lerp(INTRO.yaw, PRODUCT.yaw, e) + smoothPointer.x * 0.12;
    body.rotation.y = yaw;

    const hYaw = lerp(INTRO.headYaw, PRODUCT.headYaw, e) + smoothPointer.x * 0.45;
    const hPitch = lerp(INTRO.headPitch, PRODUCT.headPitch, e) + smoothPointer.y * 0.18;
    const hRoll = lerp(INTRO.headRoll, PRODUCT.headRoll, e);
    headPivot.rotation.set(
      Math.sin(t * 0.9) * 0.02 + hPitch,
      hYaw,
      Math.sin(t * 0.7) * 0.02 + hRoll
    );
  };

  const renderOnce = () => {
    applyCamera();
    renderer.render(scene, camera);
  };

  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, clock.getDelta());
    t += dt;

    smoothP += (progress - smoothP) * 0.08;
    smoothPointer.x += (pointer.x - smoothPointer.x) * 0.06;
    smoothPointer.y += (pointer.y - smoothPointer.y) * 0.06;

    /* idle motion */
    body.position.y = Math.sin(t * 1.4) * 0.02;
    arms.forEach((a, i) => {
      a.rotation.x = Math.sin(t * 1.4 + (i === 0 ? 0 : Math.PI)) * 0.05;
    });
    forearms.forEach((f, i) => {
      f.rotation.x = -0.35 + Math.sin(t * 1.4 + (i === 0 ? 0 : Math.PI)) * 0.06;
    });

    /* blinking */
    nextBlink -= dt;
    if (!blinking && nextBlink <= 0) {
      blinking = true;
      blinkT = 0;
    }
    let blink = 1;
    if (blinking) {
      blinkT += dt;
      const k = blinkT / 0.18;
      blink = k < 0.5 ? 1 - k * 1.8 : Math.max(0.1, (k - 0.5) * 1.8);
      if (blinkT >= 0.18) {
        blinking = false;
        blink = 1;
        nextBlink = 2.5 + Math.random() * 3;
      }
    }

    /* face fade */
    if (faceAlpha < 1) faceAlpha = Math.min(1, faceAlpha + 0.05);
    if (faceMode === 'eyes') face.draw('eyes', blink, faceAlpha);
    else face.draw('quote', 1, faceAlpha);

    applyCamera();
    renderer.render(scene, camera);
  };

  resize();
  applyCamera();

  if (opts.still) {
    renderer.render(scene, camera);
  } else {
    loop();
    renderOnce();
  }

  const onResize = () => {
    resize();
    if (opts.still) renderOnce();
  };
  window.addEventListener('resize', onResize);

  return {
    setProgress(p: number) {
      progress = Math.max(0, Math.min(1, p));
      if (opts.still) {
        smoothP = progress;
        renderOnce();
      }
    },
    setPointer(x: number, y: number) {
      pointer.x = x;
      pointer.y = y;
      if (opts.still) {
        smoothPointer.x = x;
        smoothPointer.y = y;
        renderOnce();
      }
    },
    setFace(mode: FaceMode) {
      if (mode === faceMode) return;
      faceMode = mode;
      faceAlpha = 0;
      if (opts.still) {
        faceAlpha = 1;
        face.draw(mode, 1, 1);
        renderOnce();
      }
    },
    resize: onResize,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      envRT.dispose();
      pmrem.dispose();
      ringTex.dispose();
      face.texture.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      shell.dispose();
      shellLight.dispose();
      joint.dispose();
      deep.dispose();
      pedestalMat.dispose();
      ringMat.dispose();
      screenMat.dispose();
      renderer.dispose();
    },
  };
}

/** Rounded rectangle path helper for THREE.Shape / THREE.Path. */
function roundedRect(path: THREE.Shape | THREE.Path, x: number, y: number, w: number, h: number, r: number) {
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
}
