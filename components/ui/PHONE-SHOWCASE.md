> **ARCHIVED 2026-10-29.** `PhoneShowcase` is no longer imported by any route. The home hero is
> now `components/site/flying-hero.tsx` + `components/ui/phone-flyer.ts` — a real three.js handset
> flying a keyframed path inside a sticky stage. This document is kept as the reference for the
> 6-scene stage (and for `phone-three.ts`, which the flyer's studio decisions derive from).

# PhoneShowcase — adaptation notes

`components/ui/phone-showcase.tsx` is the scroll-scrubbed 3D centrepiece. It was adapted from
the supplied `lycoris-specimen.tsx` spec: **same camera system, same six-scene choreography — but every typeface/flower/ligature reference is gone and the object is
a procedural smartphone.**

No new dependencies. React only.

---

## 1. What was replaced

| Original (specimen) | Now |
| --- | --- |
| `buildCurves()` / `buildMesh()` lily petals & stems | `buildPhone(detail)` — slab body, chrome frame, glass, camera island, buttons, USB-C notch, internals |
| `bloom` uniform (petals opening) | `explode` uniform (`uExplode`) — back glass / battery / board / screen separate along Z, then reassemble |
| Glyph inspector (typeface specimen grid) | Catalogue chips: brand/model text only, hover shows the model name + spec line |
| Ligature grid finale | Two branch cards (Lokhra / Basistha) + Call / mark / WhatsApp bar |
| `Federant` webfont + `fontHref` stylesheet | `fontFamily` prop fed by `next/font` (Bodoni Moda); `fontHref={null}` so no external CSS is injected |
| 2D fallback drawing curves | `drawPhone2D()` draws a phone outline, screen wordmark and exploded offsets |
| Camera `KEYS` tuned for a flower | Retuned: front view → camera island macro → small phone over the grid → low angle exploded → large phone right with tagline left → phone drops, cards rise |

Greps for `lily`, `flower`, `petal`, `typeface`, `ligature`, `Federant`, `bloom`, `glyph` return
nothing in the component.

---

## 2. Props

```tsx
<PhoneShowcase
  name="F-Ex Store"
  tagline="Mobile Dealer · Guwahati"
  branches={[{ name, address, hours, open, phone, phoneDisplay, directions }]}
  specs={['New Phones', 'Pre-Owned', 'Accessories', 'Expert Repairs', 'EMI & Same-Day Delivery']}
  brands={[{ label: 'Apple', href: '/new-phones?brand=Apple', meta: 'New & pre-owned' }]}
  accessories={[{ label: 'Chargers', href: '/accessories?type=charger' }]}
  ctaLinks={{ call: 'tel:+918511822537', whatsapp: 'https://wa.me/918511822537' }}
  priceRanges={[{ label: 'Under ₹10k', href: '/second-hand?price=0-10000' }]}
  ink="#0F3040"            // Deep Teal Navy
  bone="#F6EBE3"           // cream body text
  accent="#D99B7F"         // Warm Peach — the phone + all accents
  accentSecondary="#A56F63"// Dusty Rose — secondary strokes
  sceneScroll={1}          // viewport-heights of scroll per scene (0.8 on mobile)
  height={undefined}       // optional explicit stage height
  alive                    // idle spin on/off
  fontFamily={bodoni.style.fontFamily}
  fontHref={null}
  poster="/showcase-poster.jpg"
  className=""
/>
```

All props have F-Ex defaults — `<PhoneShowcase />` works on its own.

---

## 3. Six scenes

| # | Scene | Camera (portrait `KEYS_TALL`) | Copy / UI |
| --- | --- | --- | --- |
| 1 | Cover | front, radius 8.1 | Giant "F-EX" (F and X flanking the phone), "F-Ex Store / Mobile Dealer", intro paragraph, spec list, Buy/Sell/Repair stack, Est. 2024 · Lokhra · Basistha |
| 2 | Crown | behind + above, radius 4.1, target raised to the camera island | "02 — Look closer, every phone inspected" + "Genuine Parts" badge |
| 3 | Catalogue | pulled back, radius 11.2 | Two chip columns (brands), centre model name in peach + spec line, divider, accessory row |
| 4 | Atelier | low angle from below, `explode = 1` | Stacked "Screen / Battery / Motherboard", side labels Camera / Speaker / Fingerprint, "Free diagnosis at both branches" |
| 5 | Promise | large, offset, radius 7.2 | "Your next phone, / today." + Call & WhatsApp buttons + price chips → `/second-hand?price=…` |
| 6 | Branches | drops low, radius 8.4, target y 1.62 | Two branch cards with live IST open/closed, Call, Directions; bottom bar Call · F-EX · WhatsApp |

`sceneCoord(p) = p × 5`, `keyAt()` smoothsteps between keys, and `sceneWeights()` (using `HOLD`)
drives the DOM overlay opacity so the type morphs with no layout jumps.

---

## 4. Vertex layout & shaders

```
STRIDE = 10 floats
[ px py pz | nx ny nz | kind | ex ey ez ]
                            ↑      ↑
                    0 frame         explode direction × uExplode
                    1 glass
                    2 camera
                    3 internals
```

* `uModel / uView / uProj / uNormal` — camera system, roll supported via `lookAt(eye, target, roll)`.
* `envMap()` in `FRAG` builds the studio: deep teal below, plum horizon, champagne above.
  Chrome = env reflection tinted 42% peach + brushed banding + a tight `pow(…, 42)` champagne
  specular + rose fresnel.
* Screen glass uses a generated canvas texture (`makeMarkTexture`) for the tiny "F-EX /
  GUWAHATI" wordmark with a radial peach glow behind it.
* Back glass is distinguished by `vLocal.z < 0` — matte ceramic with a peach bloom.
* `gl_FrontFacing` flips normals, so face culling stays off and thin internals are solid.

Retune colours in one place: the `FRAG` uniforms are fed from the `ink` / `bone` / `accent` /
`accentSecondary` props through `hexToRgb`.

---

## 5. Mobile-first behaviour

* Portrait `KEYS_TALL` are the primary framing; `fov` widens to 0.95 under 820px.
* `sceneScroll` is clamped to **0.8** viewport-heights per scene on narrow screens.
* Side scene nav is hidden under `md`; a `01 / 06` counter replaces it.
* `devicePixelRatio` capped at **1.5**; mesh corner detail drops (`detail` 28 → 10);
  the DOM glow/vignette layers stay CSS-only (no extra blur pass in GL).
* The sticky Call + WhatsApp bar sits above the stage (z-65 vs the stage's in-page stacking).
* Reduced motion or a low-end device (≤4 cores, small viewport) renders `PosterFrame` — the AI
  poster with a per-scene scale — with simple fade transitions, no WebGL at all.

## 6. Integration rules

* Loaded only on the home page, via `next/dynamic({ ssr: false })` in
  `components/site/home-showcase.tsx`, with a poster skeleton that matches the stage height
  (no CLS).
* Uses its own `position: sticky` stage — **do not** wrap it in a GSAP pin.
* `jump()` / scene nav calls `getLenis()?.scrollTo(target)` so it shares the site's single Lenis
  instance; falls back to `window.scrollTo` when Lenis is absent (reduced motion).
* Scene nav buttons are real `<button>`s with `aria-label` + `aria-current`, focusable, and
  respond to ArrowUp/Down/Left/Right.
* WebGL context loss switches to the 2D canvas path; `prefers-reduced-motion` never mounts GL.

## Responsive contract (2026-10-28)

* **One cutover:** `PORTRAIT_MAX` (currently `1024`) drives both the JS camera selection
  (`KEYS_TALL` vs `KEYS`) and, via Tailwind `lg`, the scene composition. If you change one you
  must change the other, or copy lands on top of the handset in the 768–1023 px band.
* **Below the cutover** the six scenes are stacked: copy occupies the lower half, a single
  gradient scrim (`.bg-gradient-to-t`, `h-[72%]`) guarantees contrast, and every `KEYS_TALL`
  entry uses a negative `target.y` to lift the phone into the upper half.
* **Short viewports** (`max-height: 560px`) hide the flanking wordmark, tighten the cover copy
  and switch the poster to `object-contain`.
* **Poster path** (reduced-motion / no WebGL / low-end): the poster is portrait, so it is
  `object-contain` plus `showcase-poster-fade.webp` (alpha vignette) so it blends instead of
  showing a rectangle.

## Renderer change (2026-10-28): raw WebGL → three.js

The studio in `components/ui/phone-three.ts` now draws the phone with three.js instead of a
single hand-written shader pass. What did **not** change: this component still owns the scroll
scrubbing, the six scenes, `KEYS`/`KEYS_TALL`, the copy overlays, the letter split, the pointer
tilt / idle spin / drag-to-spin, the Lenis `jump()`, and the whole fallback ladder. It simply
hands `eye`, `target`, `roll`, `modelY`, `modelX`, `explode` and `accessories` to the scene
instead of to `gl.uniform*` calls.

Removed as dead code (was only ever consumed by the old shader): `VERT`, `FRAG`, `perspective()`,
`lookAt()`, `rotationMatrix()`, `buildPhone()`, `makeBuilder()`, `roundedRect()`, the GL matrix
helpers, `STRIDE`, the `Builder` type and `makeMarkTexture()` (the latter now exists as a canvas
texture in `phone-three.ts`).

Material notes for anyone restyling: the frame is `MeshStandardMaterial` (metalness 0.94) lit by
an equirect gradient env map run through `PMREMGenerator` — editing `makeEnvTexture()` retunes
every highlight at once, the same job `envMap()` did in the old fragment shader.

## Mobile uses photography (2026-10-28)

Below `PORTRAIT_MAX = 1024` the hero no longer renders the model at all — it renders one real
photograph per scene from the `SCENE_PHOTOS` table in `phone-showcase.tsx`:

| Scene | Photo | Why |
| --- | --- | --- |
| 1 Cover | `photo-1695048133142-1a20484d2569.jpg` | glossy handset, dark, reads instantly |
| 2 Crown | `photo-1592750475338-74b7b21085ab.jpg` | camera ring macro |
| 3 Catalogue | `accessories-flatlay.jpg` | phones + audio flatlay |
| 4 Atelier | `repair-teardown.jpg` | boards, shields, real repair bench |
| 5 Promise | `repair-macro.jpg` | technician mid-repair, warm |
| 6 Branches | `store-interior.jpg` | the shop floor |

Each has an alpha-vignetted `public/mobile/scene-N-fade.webp` (~58–124 KB) generated with the same
ffmpeg `geq` command used for the cover poster, so the frame melts into the ink backdrop rather
than sitting in a rectangle. `object-contain` keeps the whole product in frame on a narrow stage;
`object-cover` cropped a landscape shot down to a sliver of bezel when this was first tried.

The scrim is deliberately uneven: light at the top so the photograph reads, heavy at the bottom
behind the body copy, because every line there still has to pass AA contrast.
