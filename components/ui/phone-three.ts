/**
 * Real three.js studio for the hero — replaces the hand-written raw-WebGL pass.
 *
 * Everything the old fragment shader faked is now actual geometry with actual
 * materials: an extruded aluminium frame, a glass screen with a live wallpaper
 * texture, a camera island with real lens barrels, and the internals that fly
 * apart in the Atelier scene. Lighting is a real key/rim/fill rig plus a
 * PMREM-filtered procedural environment, so highlights and reflections are
 * computed from the palette rather than hand-rolled in a shader.
 *
 * The backdrop is real geometry too: a curved studio cove with baked vertex
 * colours, an instanced 3D bokeh field that parallaxes as the camera orbits,
 * and a glowing orb body — no screen-space sprites or painted planes.
 *
 * Design constraints kept from the raw-GL version:
 *  - no `three/examples` addons (RoundedBoxGeometry etc.) — geometry is built
 *    from Shape + ExtrudeGeometry so there is nothing to break on upgrades;
 *  - the canvas context is never force-lost, because React StrictMode remounts
 *    the effect and a canvas can only hand out one context;
 *  - mobile budget: fewer curve segments, DPR capped by the caller, no shadows,
 *    no post-processing, one render target.
 */
import * as THREE from 'three';

export type ThreePhoneOptions = {
  canvas: HTMLCanvasElement;
  ink: string;
  bone: string;
  accent: string;
  accentSecondary: string;
  plum?: string;
  /** Brand text drawn onto the phone wallpaper. */
  brand?: string;
  /** Coarse geometry for small screens / weak GPUs. */
  lowDetail?: boolean;
  /** Max device pixel ratio (caller decides: 1.5 mobile, 2 desktop). */
  dprCap: number;
};

export type ThreeFrameState = {
  /** Camera position, world units. */
  eye: [number, number, number];
  /** Camera look-at target. */
  target: [number, number, number];
  /** Camera roll, radians. */
  roll: number;
  /** Phone rotation around Y (idle sway + drag + tilt), radians. */
  modelY: number;
  /** Phone rotation around X (pointer tilt), radians. */
  modelX: number;
  /** 0 = assembled, 1 = fully exploded (Atelier scene). */
  explode: number;
  /** 0 = hidden, 1 = fully present (accessory scene). */
  accessories: number;
  /** Seconds, for subtle life (glow breathing). */
  time: number;
};

export type ThreePhoneHandle = {
  render: (state: ThreeFrameState) => void;
  resize: (cssWidth: number, cssHeight: number, dpr: number) => void;
  dispose: () => void;
};

/** Phone body dimensions in world units (matches the previous shader geometry). */
const BODY = { w: 1.0, h: 2.06, r: 0.2, t: 0.17 };
const BEVEL = 0.012;
/**
 * Z of the frame's front face. The extrusion bevel sits *outside* the plate
 * depth, so the screen has to clear `t/2 + bevel` — putting it at `t/2` leaves
 * it buried behind the metal cap (the first bug this port hit).
 */
const FRONT_Z = BODY.t / 2 + BEVEL;

/** Rounded rectangle Shape centred on the origin. */
function roundedShape(w: number, h: number, r: number, curveSegments: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const rad = Math.min(r, Math.min(w, h) / 2);
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

/** A plate with soft bevelled edges — the phone frame, island, buttons. */
function bevelPlate(w: number, h: number, r: number, depth: number, bevel: number, seg: number): THREE.ExtrudeGeometry {
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

/**
 * ShapeGeometry emits UVs equal to the *shape's own coordinates*, not 0..1, so a
 * texture mapped straight onto it tiles and lands off-centre (that is what made
 * the wallpaper look shifted and clipped). Remap UVs from the position bounds.
 */
function normalizeUV(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  if (!bb) return geo;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv) return geo;
  const w = bb.max.x - bb.min.x || 1;
  const h = bb.max.y - bb.min.y || 1;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - bb.min.x) / w, (pos.getY(i) - bb.min.y) / h);
  }
  uv.needsUpdate = true;
  return geo;
}

/** Flat rounded panel (screen, back glass) — no extrusion, no bevel. */
function flatPlate(w: number, h: number, r: number, seg: number): THREE.BufferGeometry {
  const g = normalizeUV(new THREE.ShapeGeometry(roundedShape(w, h, r, seg), seg));
  g.computeVertexNormals();
  return g;
}

/* ------------------------------ textures ------------------------------ */

/** Equirectangular studio gradient: deep teal low, plum mid, champagne high. */
function makeEnvTexture(ink: string, plum: string, accent: string, bone: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, bone);
  g.addColorStop(0.34, '#e6cfc4');
  g.addColorStop(0.5, accent);
  g.addColorStop(0.62, plum);
  g.addColorStop(1, ink);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  // Warm horizon band + a bright softbox patch: what the metal actually reflects.
  const horizon = ctx.createLinearGradient(0, 96, 0, 168);
  horizon.addColorStop(0, 'rgba(217,155,127,0)');
  horizon.addColorStop(0.5, 'rgba(240,196,166,0.85)');
  horizon.addColorStop(1, 'rgba(217,155,127,0)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 96, 512, 72);

  const soft = ctx.createRadialGradient(360, 52, 4, 360, 52, 92);
  soft.addColorStop(0, 'rgba(255,250,244,0.95)');
  soft.addColorStop(1, 'rgba(255,250,244,0)');
  ctx.fillStyle = soft;
  ctx.fillRect(0, 0, 512, 160);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

/** Soft radial falloff, used as an alpha map on the glow orb and bokeh. */
function makeGlowTexture(accent: string): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,226,205,0.72)');
  g.addColorStop(0.16, 'rgba(217,155,127,0.85)');
  g.addColorStop(0.42, 'rgba(217,155,127,0.22)');
  g.addColorStop(0.72, 'rgba(165,111,99,0.09)');
  g.addColorStop(1, 'rgba(165,111,99,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Phone wallpaper: the brand mark, status bar and an app grid. */
function makeScreenTexture(ink: string, bone: string, accent: string, brand: string): THREE.CanvasTexture {
  const W = 512;
  const H = 1080;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // Near-black glass. The previous version lit this like a UI mockup (bright
  // peach tiles on a pale field), which read as a toy next to the rose overlaid
  // monogram. Deep teal, low-contrast content, mark barely etched in.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#061014');
  bg.addColorStop(0.5, '#081C27');
  bg.addColorStop(1, '#0c1f2a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.34, H * 0.74, 10, W * 0.34, H * 0.74, 470);
  glow.addColorStop(0, 'rgba(217,155,127,0.16)');
  glow.addColorStop(1, 'rgba(217,155,127,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const spaced = (text: string, font: string, y: number, gap: number, colour: string, alpha = 1) => {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = colour;
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const widths = [...text].map((ch) => ctx.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (text.length - 1);
    let x = W / 2 - total / 2;
    [...text].forEach((ch, i) => {
      ctx.fillText(ch, x, y);
      x += widths[i] + gap;
    });
    ctx.restore();
  };

  // status bar
  spaced('10:00', '500 24px Arial, Helvetica, sans-serif', 54, 1, bone, 0.34);
  ctx.fillStyle = bone;
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 4; i++) ctx.fillRect(352 + i * 12, 58 - i * 4, 8, 6 + i * 4);
  ctx.globalAlpha = 1;

  // brand mark
  spaced(brand.toUpperCase(), '600 42px Georgia, "Times New Roman", serif', H * 0.44, 10, accent, 0.42);
  spaced('MOBILE DEALER · GUWAHATI', '400 16px Arial, Helvetica, sans-serif', H * 0.44 + 40, 6, bone, 0.2);

  // app grid
  const cols = 4;
  const size = 76;
  const gap = 34;
  const left = (W - (cols * size + (cols - 1) * gap)) / 2;
  const top = H * 0.55;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < cols; col++) {
      const x = left + col * (size + gap);
      const y = top + row * (size + gap);
      ctx.globalAlpha = 0.028 + ((row + col) % 5) * 0.014;
      ctx.fillStyle = col % 2 === row % 2 ? accent : bone;
      const rad = 18;
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + size, y, x + size, y + size, rad);
      ctx.arcTo(x + size, y + size, x, y + size, rad);
      ctx.arcTo(x, y + size, x, y, rad);
      ctx.arcTo(x, y, x + size, y, rad);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // dock
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = bone;
  ctx.beginPath();
  ctx.roundRect(W * 0.12, H - 176, W * 0.76, 120, 40);
  ctx.fill();
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Logic-board decal for the internals. */
function makeBoardTexture(accent: string): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#14232c';
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(217,155,127,0.5)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 26; i++) {
    const y = 12 + i * 9;
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(70 + (i % 5) * 26, y);
    ctx.lineTo(96 + (i % 5) * 26, y + 8);
    ctx.lineTo(S - 14, y + 8);
    ctx.stroke();
  }
  ctx.fillStyle = accent;
  for (let i = 0; i < 12; i++) {
    ctx.globalAlpha = 0.35 + (i % 4) * 0.12;
    ctx.fillRect(24 + (i % 4) * 58, 24 + Math.floor(i / 4) * 74, 30, 20);
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------- factory ------------------------------- */

export function createThreePhone(opts: ThreePhoneOptions): ThreePhoneHandle | null {
  const { canvas, ink, bone, accent, accentSecondary } = opts;
  const plum = opts.plum ?? '#464858';
  const lowDetail = Boolean(opts.lowDetail);
  const seg = lowDetail ? 8 : 22;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !lowDetail,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setClearAlpha(0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  /* ---------------------------- environment ---------------------------- */
  const envSource = track(makeEnvTexture(ink, plum, accent, bone));
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromEquirectangular(envSource);
  scene.environment = envRT.texture;
  envSource.dispose();

  /* ------------------------------- lights ------------------------------ */
  const key = new THREE.DirectionalLight(0xfff3e8, 2.6);
  key.position.set(2.6, 3.1, 3.2);
  const rim = new THREE.DirectionalLight(accentSecondary, 2.1);
  rim.position.set(-3.2, 1.1, -2.4);
  const fill = new THREE.DirectionalLight(0x9fc2d2, 0.85);
  fill.position.set(-1.6, -2.2, 2.4);
  const edge = new THREE.DirectionalLight(0xffd9c0, 1.15);
  edge.position.set(0.2, 0.4, -3.4);
  const glowLight = new THREE.PointLight(accent, 1.15, 10, 2);
  glowLight.position.set(0.1, -0.4, -1.5);
  scene.add(key, rim, fill, edge, glowLight, new THREE.AmbientLight(0x2b3d49, 0.5));

  /* --------------------------- studio backdrop -------------------------- */
  /*
   * Real geometry, not a painted plate. The backdrop is an actual curved
   * cyclorama that wraps the scene, so it parallaxes and takes light as the
   * camera orbits — a flat plane reads as a sticker the moment the view moves.
   * Vertex colours bake the teal→plum falloff into the surface itself.
   */
  // Tall enough that neither rim can enter frame at any keyframe. At height 34
  // the bottom rim showed up in the close-up scene as a hard horizon arc across
  // the copy.
  const COVE_H = 78;
  const coveGeo = track(new THREE.CylinderGeometry(17.5, 17.5, COVE_H, 48, 16, true));
  {
    const pos = coveGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(ink).multiplyScalar(0.42);
    const mid = new THREE.Color(plum).multiplyScalar(0.36);
    const high = new THREE.Color('#06303f');
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp((pos.getY(i) + COVE_H / 2) / COVE_H, 0, 1);
      // horizon band brighter than both poles: light pooling behind the handset
      const horizon = Math.pow(Math.sin(t * Math.PI), 0.65);
      tmp.copy(low).lerp(mid, horizon * 0.85).lerp(high, 1 - horizon);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    coveGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }
  const cove = new THREE.Mesh(
    coveGeo,
    track(
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      })
    )
  );
  scene.add(cove);

  /** Bright centre, faded silhouette — a glowing body rather than a flat disc. */
  const glowSphereMaterial = (core: string, edge: string, power: number, strength: number) =>
    track(
      new THREE.ShaderMaterial({
        uniforms: {
          uCore: { value: new THREE.Color(core) },
          uEdge: { value: new THREE.Color(edge) },
          uPower: { value: power },
          uStrength: { value: strength },
        },
        vertexShader: `
          varying float vFacing;
          varying float vDepth;
          void main() {
            #ifdef USE_INSTANCING
              mat4 im = instanceMatrix;
            #else
              mat4 im = mat4(1.0);
            #endif
            vec4 mv = modelViewMatrix * im * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * mat3(im) * normal);
            vFacing = max(dot(n, normalize(-mv.xyz)), 0.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          uniform vec3 uCore; uniform vec3 uEdge; uniform float uPower; uniform float uStrength;
          varying float vFacing; varying float vDepth;
          void main() {
            float f = pow(vFacing, uPower);
            // fade the furthest motes so the field has depth instead of a flat wall
            float fog = clamp(1.0 - (vDepth - 3.0) / 12.0, 0.0, 1.0);
            vec3 c = mix(uEdge, uCore, pow(f, 1.7));
            gl_FragColor = vec4(c * f, f * uStrength * fog);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );

  /* ---------------------------- 3D bokeh dust --------------------------- */
  /*
   * Instanced spheres scattered through a real volume behind the handset. They
   * are lit, occlude each other and shift against the camera as it orbits —
   * parallax that a screen-space glow layer can never produce. One draw call.
   */
  const BOKEH = lowDetail ? 26 : 58;
  const bokehGeo = track(new THREE.SphereGeometry(1, lowDetail ? 8 : 14, lowDetail ? 6 : 10));
  // strength kept low: these sit behind body copy, which must stay AA-legible
  const bokehMat = glowSphereMaterial('#ffd8be', accent, 1.5, 0.34);
  const bokeh = new THREE.InstancedMesh(bokehGeo, bokehMat, BOKEH);
  bokeh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bokeh.frustumCulled = false;
  bokeh.renderOrder = -1;
  scene.add(bokeh);

  // Deterministic scatter (no Math.random) so the composition is repeatable.
  const seeds: { base: THREE.Vector3; scale: number; phase: number }[] = [];
  for (let i = 0; i < BOKEH; i++) {
    const a = (i / BOKEH) * Math.PI * 2 * 3.7;
    const r = 2.4 + ((i * 37) % 100) / 100 * 4.6;
    const y = ((i * 53) % 100) / 100 * 5.6 - 3.4;
    const s = 0.05 + ((i * 29) % 100) / 100 * 0.13;
    seeds.push({
      base: new THREE.Vector3(Math.sin(a) * r, y, -1.6 - ((i * 71) % 100) / 100 * 4.4),
      scale: s,
      phase: (i * 0.7) % (Math.PI * 2),
    });
  }

  /* ----------------------------- glow orb ------------------------------- */
  // A real glowing body: a sphere with an additive falloff, so it sits in the
  // scene at a depth and parallaxes with everything else.
  const orb = new THREE.Mesh(
    track(new THREE.SphereGeometry(1, lowDetail ? 20 : 40, lowDetail ? 14 : 28)),
    glowSphereMaterial('#ffe0cb', accent, 2.2, 0.9)
  );
  orb.renderOrder = -2; // draw the backdrop body before the handset
  scene.add(orb);

  /* ------------------------------- phone ------------------------------- */
  const phone = new THREE.Group();
  scene.add(phone);

  const frameMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3a4a53').lerp(new THREE.Color(plum), 0.35),
      metalness: 0.96,
      roughness: 0.17,
      envMapIntensity: 1.45,
    })
  );
  const frame = new THREE.Mesh(bevelPlate(BODY.w, BODY.h, BODY.r, BODY.t, 0.012, seg), frameMat);
  phone.add(frame);

  // screen
  const screenTex = track(makeScreenTexture(ink, bone, accent, opts.brand ?? 'F-EX'));
  const screenMat = track(
    new THREE.MeshStandardMaterial({
      map: screenTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: screenTex,
      emissiveIntensity: 0.16,
      roughness: 0.26,
      metalness: 0.06,
      envMapIntensity: 1.05,
    })
  );
  const screen = new THREE.Mesh(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg), screenMat);
  screen.position.z = FRONT_Z + 0.0012;
  phone.add(screen);

  // front glass
  const glassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.6,
      depthWrite: false,
    })
  );
  const glass = new THREE.Mesh(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg), glassMat);
  glass.position.z = FRONT_Z + 0.0045;
  phone.add(glass);

  // back glass
  const backMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(plum).multiplyScalar(0.8),
      metalness: 0.62,
      roughness: 0.18,
      envMapIntensity: 1.5,
    })
  );
  const back = new THREE.Mesh(flatPlate(BODY.w - 0.05, BODY.h - 0.05, BODY.r - 0.02, seg), backMat);
  back.position.z = -FRONT_Z - 0.0008;
  back.rotation.y = Math.PI;
  phone.add(back);

  /* --------------------------- camera island --------------------------- */
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
  const island = new THREE.Mesh(bevelPlate(0.46, 0.48, 0.14, 0.05, 0.008, lowDetail ? 6 : 14), islandMat);
  island.rotation.y = Math.PI;
  islandGroup.add(island);

  const lensRingMat = track(
    new THREE.MeshStandardMaterial({ color: '#101b21', metalness: 0.9, roughness: 0.35, envMapIntensity: 1.1 })
  );
  const lensGlassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: '#080f13',
      metalness: 0.15,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.2,
    })
  );
  const lensGeo = track(new THREE.CylinderGeometry(0.082, 0.082, 0.036, lowDetail ? 12 : 28));
  const lensGlassGeo = track(new THREE.SphereGeometry(0.055, lowDetail ? 12 : 24, lowDetail ? 8 : 16, 0, Math.PI * 2, 0, Math.PI / 2));

  const lensSpots: [number, number][] = [
    [-0.11, 0.12],
    [-0.11, -0.12],
    [0.11, 0.0],
  ];
  for (const [lx, ly] of lensSpots) {
    const ring = new THREE.Mesh(lensGeo, lensRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(lx, ly, -0.025);
    const glassLens = new THREE.Mesh(lensGlassGeo, lensGlassMat);
    glassLens.rotation.x = Math.PI / 2;
    glassLens.position.set(lx, ly, -0.03);
    islandGroup.add(ring, glassLens);
  }
  const flashMat = track(new THREE.MeshStandardMaterial({ color: bone, emissive: accent, emissiveIntensity: 0.5, roughness: 0.4 }));
  const flashGeo = track(new THREE.CylinderGeometry(0.032, 0.032, 0.02, 12));
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.rotation.x = Math.PI / 2;
  flash.position.set(0.12, 0.17, -0.03);
  islandGroup.add(flash);

  /* ---------------------------- side keys ------------------------------ */
  const buttonMat = track(
    new THREE.MeshStandardMaterial({ color: new THREE.Color(plum).multiplyScalar(0.7), metalness: 0.9, roughness: 0.3 })
  );
  const buttonGeo = track(new THREE.BoxGeometry(0.014, 0.14, 0.05));
  const volUp = new THREE.Mesh(buttonGeo, buttonMat);
  volUp.position.set(-BODY.w / 2 - 0.006, 0.42, 0);
  const volDown = new THREE.Mesh(buttonGeo, buttonMat);
  volDown.position.set(-BODY.w / 2 - 0.006, 0.2, 0);
  const powerGeo = track(new THREE.BoxGeometry(0.014, 0.22, 0.05));
  const power = new THREE.Mesh(powerGeo, buttonMat);
  power.position.set(BODY.w / 2 + 0.006, 0.3, 0);
  phone.add(volUp, volDown, power);

  /* --------------------------- internals ------------------------------- */
  type Exploding = { mesh: THREE.Object3D; base: THREE.Vector3; dir: THREE.Vector3; dist: number };
  const exploding: Exploding[] = [];
  const internals = new THREE.Group();
  phone.add(internals);

  const addPart = (mesh: THREE.Object3D, x: number, y: number, z: number, dir: [number, number, number], dist: number) => {
    mesh.position.set(x, y, z);
    internals.add(mesh);
    exploding.push({ mesh, base: new THREE.Vector3(x, y, z), dir: new THREE.Vector3(...dir).normalize(), dist });
  };

  const batteryMat = track(new THREE.MeshStandardMaterial({ color: '#1b2b34', metalness: 0.35, roughness: 0.55 }));
  const battery = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.92, 0.05)), batteryMat);
  addPart(battery, 0, -0.42, -0.02, [0, -0.55, -1], 1.15);

  const boardTex = track(makeBoardTexture(accent));
  const boardMat = track(new THREE.MeshStandardMaterial({ map: boardTex, metalness: 0.5, roughness: 0.45 }));
  const board = new THREE.Mesh(track(new THREE.BoxGeometry(0.7, 0.66, 0.022)), boardMat);
  addPart(board, 0.02, 0.44, -0.02, [0.15, 0.6, -1], 1.05);

  const speakerMat = track(new THREE.MeshStandardMaterial({ color: '#23343d', metalness: 0.6, roughness: 0.4 }));
  const speaker = new THREE.Mesh(track(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 18)), speakerMat);
  addPart(speaker, 0, 0.94, -0.02, [0, 1, -0.7], 1.3);

  const coilMat = track(
    new THREE.MeshStandardMaterial({ color: accentSecondary, metalness: 0.7, roughness: 0.35, emissive: accent, emissiveIntensity: 0.15 })
  );
  const coil = new THREE.Mesh(track(new THREE.TorusGeometry(0.15, 0.014, 8, 26)), coilMat);
  addPart(coil, 0, -0.02, 0.02, [0, 0, -1], 0.85);

  const screwMat = track(new THREE.MeshStandardMaterial({ color: '#8f9ea6', metalness: 0.95, roughness: 0.28 }));
  const screwGeo = track(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 10));
  const screws: [number, number][] = [
    [-0.42, 0.92],
    [0.42, 0.92],
    [-0.42, -0.92],
    [0.42, -0.92],
  ];
  screws.forEach(([sx, sy], i) => {
    const screw = new THREE.Mesh(screwGeo, screwMat);
    addPart(screw, sx, sy, -0.03, [sx * 1.6, sy * 0.25, -1], 0.75 + i * 0.05);
  });

  /* --------------------------- accessories ----------------------------- */
  const accessoryGroup = new THREE.Group();
  accessoryGroup.position.set(1.15, -0.7, 0.15);
  phone.add(accessoryGroup);

  const caseMat = track(
    new THREE.MeshPhysicalMaterial({ color: bone, roughness: 0.35, metalness: 0.05, clearcoat: 0.8, transparent: true, opacity: 0 })
  );
  const buds = new THREE.Mesh(bevelPlate(0.34, 0.28, 0.11, 0.13, 0.02, lowDetail ? 6 : 16), caseMat);
  buds.rotation.set(0.2, -0.5, 0.08);
  accessoryGroup.add(buds);

  const watchMat = track(
    new THREE.MeshStandardMaterial({ color: accentSecondary, metalness: 0.8, roughness: 0.3, transparent: true, opacity: 0 })
  );
  const watch = new THREE.Mesh(track(new THREE.TorusGeometry(0.14, 0.032, 10, 30)), watchMat);
  watch.position.set(-0.42, 0.28, 0.1);
  watch.rotation.set(0.5, 0.3, 0);
  accessoryGroup.add(watch);

  const puckMat = track(
    new THREE.MeshStandardMaterial({ color: '#e9ded6', metalness: 0.2, roughness: 0.6, transparent: true, opacity: 0 })
  );
  const puck = new THREE.Mesh(track(new THREE.CylinderGeometry(0.16, 0.17, 0.035, 26)), puckMat);
  puck.position.set(0.05, -0.34, 0.16);
  puck.rotation.set(0.35, 0, 0.1);
  accessoryGroup.add(puck);

  const accessoryMats = [caseMat, watchMat, puckMat];
  accessoryGroup.visible = false;

  /* ------------------------------ render ------------------------------- */
  const state: ThreeFrameState = {
    eye: [0, 0, 5],
    target: [0, 0, 0],
    roll: 0,
    modelY: 0,
    modelX: 0,
    explode: 0,
    accessories: 0,
    time: 0,
  };

  const tmpTarget = new THREE.Vector3();
  const viewDir = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  const handle: ThreePhoneHandle = {
    resize(cssWidth, cssHeight, dpr) {
      const w = Math.max(1, Math.round(cssWidth));
      const h = Math.max(1, Math.round(cssHeight));
      renderer.setPixelRatio(Math.min(dpr, opts.dprCap));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 0.95 ? 54 : 44; // portrait needs a wider lens to fit the phone
      camera.updateProjectionMatrix();
    },

    render(next) {
      Object.assign(state, next);

      camera.position.set(state.eye[0], state.eye[1], state.eye[2]);
      tmpTarget.set(state.target[0], state.target[1], state.target[2]);
      camera.lookAt(tmpTarget);
      if (state.roll) camera.rotateZ(state.roll);

      phone.rotation.set(state.modelX, state.modelY, 0);

      for (const e of exploding) {
        e.mesh.position.copy(e.base).addScaledVector(e.dir, state.explode * e.dist);
      }
      internals.visible = state.explode > 0.01;

      const acc = state.accessories;
      accessoryGroup.visible = acc > 0.02;
      if (accessoryGroup.visible) {
        for (const m of accessoryMats) m.opacity = Math.min(1, acc) * 0.96;
        accessoryGroup.scale.setScalar(0.82 + 0.18 * acc);
        accessoryGroup.position.y = -0.7 + (1 - acc) * 0.22;
      }

      // Real 3D backdrop animation -------------------------------------------
      const breathe = 1 + Math.sin(state.time * 0.6) * 0.035;

      // The glow orb sits behind the handset along the view axis, so it stays
      // centred no matter where the camera orbits.
      viewDir.copy(camera.position).sub(tmpTarget).normalize();
      // Far enough back that the sphere's near cap cannot poke in front of the
      // phone — at -1.35 with radius ~1.55 it glowed straight through the screen.
      orb.position.copy(tmpTarget).addScaledVector(viewDir, -3.4);
      orb.scale.setScalar(2.0 * breathe);

      // Bokeh: slow drift + per-instance bob. Depth is untouched, so the
      // parallax between near and far motes is what sells the volume.
      for (let i = 0; i < BOKEH; i++) {
        const b = seeds[i];
        const wob = Math.sin(state.time * 0.35 + b.phase) * 0.16;
        dummy.position.set(
          b.base.x + wob * 0.5,
          b.base.y + Math.sin(state.time * 0.28 + b.phase) * 0.22,
          b.base.z + wob * 0.3
        );
        dummy.scale.setScalar(b.scale * (0.86 + Math.sin(state.time * 0.5 + b.phase) * 0.14));
        dummy.rotation.set(b.phase, b.phase * 0.5, 0);
        dummy.updateMatrix();
        bokeh.setMatrixAt(i, dummy.matrix);
      }
      bokeh.instanceMatrix.needsUpdate = true;

      glowLight.intensity = 1.05 + Math.sin(state.time * 0.6) * 0.08;

      renderer.render(scene, camera);
    },

    dispose() {
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* nothing else to do */
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
      flashMat.dispose();
      buttonMat.dispose();
      batteryMat.dispose();
      boardMat.dispose();
      speakerMat.dispose();
      coilMat.dispose();
      screwMat.dispose();
      caseMat.dispose();
      watchMat.dispose();
      puckMat.dispose();
      // NOTE: no forceContextLoss() — StrictMode remounts reuse this canvas.
      renderer.dispose();
    },
  };

  handle.resize(canvas.clientWidth || 800, canvas.clientHeight || 600, opts.dprCap);
  return handle;
}
