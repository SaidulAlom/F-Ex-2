# F-Ex Store — website + admin panel

> New and pre-owned smartphones, accessories and expert repairs in Guwahati.
> Two branches — **Lokhra** (beside Sarusajai Stadium) and **Basistha** (Lakhi Mandir) —
> open every day till 10 PM.

A luxury-maximalist storefront (Deep Teal, Slate Plum, Dusty Rose, Warm Peach) built on
Next.js App Router with a raw-WebGL 3D phone stage, plus a deliberately calm admin panel
for staff to run stock, leads, banners and testimonials.

---

## 1. Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, React Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS variables, shadcn-style primitives in `/components/ui` |
| Motion | Framer Motion (UI), GSAP + ScrollTrigger (scroll choreography), Lenis (smooth scroll) |
| 3D | three.js hero flyer (`components/site/flying-hero.tsx` + `components/ui/phone-flyer.ts`); photo fallbacks |
| Data | MongoDB + Mongoose |
| Auth | NextAuth (credentials, bcrypt, Owner + BranchStaff roles) |
| Forms | Zod + React Hook Form |
| Media | Cloudinary (signed direct uploads + server uploads) |
| Email | Resend (lead notification + customer acknowledgement) |
| Deploy | Vercel |

---

## 2. Install & run

```bash
# 1. install
npm install

# 2. environment
cp .env.example .env.local
#    → fill MONGODB_URI, NEXTAUTH_SECRET, CLOUDINARY_*, RESEND_API_KEY

# 3. database
npm run seed          # 12 products, 2 branches, 3 banners, 5 testimonials, owner + staff

# 4. develop
npm run dev           # http://localhost:3000
```

Useful scripts:

```bash
npm run build      # production build
npm start          # production server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run seed       # idempotent upsert of demo content
```

**Minimum to boot the storefront:** nothing. Without `MONGODB_URI` the site serves the
demo catalogue from `lib/demo-data.ts` so design work and previews are never broken.
The admin panel shows a clear "no database connected" notice instead of fake numbers.

Generate a secret: `openssl rand -base64 32`.

---

## 3. Project structure

```
fex-store/
├── app/
│   ├── layout.tsx                 # fonts (Bodoni Moda / Sora / Cormorant), JSON-LD, GA4
│   ├── globals.css                # design tokens, film-grain, foil, glass, keyframes
│   ├── page.tsx                   # home (10 sections, see §5)
│   ├── new-phones/                # catalogue: new phones
│   ├── second-hand/               # catalogue: certified pre-owned
│   ├── accessories/               # catalogue: accessories & gadgets
│   ├── repairs/                   # atelier + service menu + repair form
│   ├── emi-payments/
│   ├── delivery/
│   ├── branches/page.tsx          # both branches + maps
│   ├── branches/[slug]/           # Lokhra / Basistha (local SEO + map + stock)
│   ├── about/                     # brand story + pinned promise
│   ├── contact/                   # contact form + branch cards + maps
│   ├── sell/                      # Phase 2 "coming soon" + early-access list
│   ├── product/[slug]/            # gallery, specs, reserve form, Product JSON-LD
│   ├── not-found.tsx
│   ├── sitemap.ts  robots.ts
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── leads/                 # single intake for every public form
│   │   ├── search/                # live suggestions
│   │   ├── upload/repair/         # public Cloudinary upload (rate limited)
│   │   ├── upload/sign/           # signed params for admin uploads
│   │   └── admin/export/          # leads CSV
│   └── admin/
│       ├── login/                 # credentials sign-in
│       └── (dashboard)/           # protected shell (sidebar) + pages
│           ├── page.tsx           # overview / KPIs
│           ├── products/          # list · new · [id] edit
│           ├── leads/             # table, filters, status updates, CSV
│           ├── banners/           # offers & hero banners
│           ├── testimonials/
│           ├── branches/          # owner-only branch details
│           └── actions.ts         # server actions (revalidateTag on write)
├── components/
│   ├── ui/                        # shadcn primitives, phone-flyer.ts (3D hero), video-loop.tsx
│   ├── layout/                    # header, footer, mobile call bar, open-status
│   ├── site/                      # home sections, product card, maps, ateliers, media-band
│   ├── catalogue/                 # filterable grid (URL-synced)
│   ├── product/                   # gallery, reserve form
│   ├── forms/                     # contact / repair / sell + photo upload
│   ├── admin/                     # sidebar, product form, tables, managers
│   ├── anim/                      # reveal, clip-wipe, count-up, magnetic
│   └── providers/                 # Lenis provider (single instance)
├── hooks/                         # use-lenis, use-gsap, use-media-query, cursor…
├── lib/
│   ├── config.ts                  # ★ all business data, hours, WhatsApp, socials (TODOs)
│   ├── db.ts  queries.ts          # cached reads, tagged revalidation
│   ├── auth.ts  validators.ts     # NextAuth + every Zod schema
│   ├── seo.ts  analytics.ts       # metadata, JSON-LD, GA4 events
│   ├── mail.ts  cloudinary.ts     # Resend templates, signed uploads
│   ├── rate-limit.ts  leads.ts    # abuse protection + lead pipeline
│   ├── image.ts  utils.ts  filters.ts  demo-data.ts
├── models/                        # Product, Branch, Lead, Banner, Testimonial, User
├── scripts/seed.ts                # seed / upsert content
├── middleware.ts                  # /admin protection
└── public/                        # all real media, self-hosted (see §15)
    ├── images/                    # 29 JPEGs — products, store, bench, accessories
    ├── video/                     # 3 H.264 loops + 3 poster frames
    ├── favicon.svg
    └── showcase-poster.jpg        # still used by the 3D stage fallback
```

---

## 4. Design system

### Colour tokens (`app/globals.css` + `tailwind.config.ts`)

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#0F3040` | Primary background, hero, dark sections |
| `ink-deep` | `#081C27` | Deepest shadows, footer |
| `plum` | `#464858` | Cards, glass panels, borders on dark — **never text on ink** |
| `rose` | `#A56F63` | Secondary accent: 24px+ text, icons, decoration |
| `peach` | `#D99B7F` | CTAs, links, glows, foil, headline accents |
| `cream` | `#F6EBE3` | Light sections, body text on dark |

Gradients: `bg-teal-plum` (Deep Teal → Slate Plum) and `bg-foil` (Dusty Rose → Warm Peach →
champagne). Contrast rules from the brief are enforced by convention and reviewed in the CSS
comments — Dusty Rose is only used at 24px+, for icons and for decoration.

### Type

* **Display:** Bodoni Moda (`--font-display`) via `next/font` — 12vw+ headlines, italic accents.
* **Sans:** Sora (`--font-sans`) — UI, labels, tracking-heavy meta.
* **Script:** Cormorant Garamond italic (`--font-script`) — pull-quotes and signatures.

### Motion knobs (where to tune)

| What | File | Knob |
| --- | --- | --- |
| Smooth scroll feel | `hooks/use-lenis.ts` | `duration: 1.15`, easing curve |
| Loader | `components/ui/loader.tsx` | wordmark lifts in (4 letters, 75ms stagger), counter 000→100, wipe up. Total 1150ms + 620ms exit |
| Text reveals | `components/anim/reveal.tsx` | `stagger` 0.045, `duration` 0.9 |
| Marquees | `components/ui/marquee.tsx` | `--marquee-duration` (38s default) |
| Cursor glow trail | `hooks/use-custom-cursor.ts` | lerp `0.12` |
| Horizontal gallery | `components/site/featured-phones.tsx` | `scrub: 0.6`, pin distance |
| Stacking cards | `components/site/category-stack.tsx` | `top:` offset, scale 0.92→1 |
| Repair atelier scrub | `components/site/repair-atelier.tsx` | `end: '+=2400'` |
| Pinned promise | `components/site/promise-pinned.tsx` | `h-[300vh]`, colour stops |
| Hero reveal | `components/site/pill-hero.tsx` | `DURATION` (2.1 s) + the `win()` windows; `--fs` in `globals.css` |

Everything degrades under `prefers-reduced-motion`: Lenis is not created, the loader is
skipped, reveals become static, pins are not built, and the 3D stage renders a still poster.

---

## 5. Home page sections

| # | Section | Component |
| --- | --- | --- |
| 1 | Loader → hero: the curtain-split hero — eight shop photographs stacked like a closed curtain that parts on scroll/click to reveal “Phones, Honestly.” (100vh) | `components/ui/curtain-split-hero.tsx` |
| 2 | Story panel: the React Bits `CircularCarousel` ring of six F-Ex chapters (draggable, auto-drifting, captions) on deep teal, headline bottom-left (100vh) | `components/site/story-ring.tsx`, `components/site/circular-carousel.tsx`, `app/story.css`, `app/circular-carousel.css` |
| 3 | Dual marquee + live offer | `components/site/marquee-strip.tsx` |
| 4 | Brand statement (collage + pull-quote, cream) | `brand-statement.tsx` |
| 5 | Featured phones — vertical scroll drives a horizontal track | `featured-phones.tsx` |
| 6 | Category stacked cards (New, Pre-Owned, Accessories, Repairs) | `category-stack.tsx` |
| 7 | EMI & payments badges | `emi-payments.tsx` |
| 8 | Branch showcase (map, hours, call) | `branch-showcase.tsx` |
| 9 | Testimonials infinite slider | `testimonials.tsx` |
| 10 | Final CTA (full-bleed) | `final-cta.tsx` |
| 11 | Footer with giant F-EX wordmark | `layout/footer.tsx` |

The first two panels of the home page mount one WebGL canvas: the paper stage's counter robot (§ below), loaded on demand. Everything after it is DOM, CSS and one `<video>`.
"The F-Ex Promise" and "Repair Atelier" live as `PromisePinned` (on `/about`) and
`RepairAtelier` (on `/repairs`) for the deeper read.

### Home hero + §2 — the paper stage (2026-10-29, current)

The first two panels of the home page are a warm paper sheet (`#efece6`) ruled with three
hairlines at 17 %, 50 % and 83 %, with a boxy white-ceramic robot standing on a charcoal
pedestal. Scroll eases the camera from a full figure (intro) to a close-up of its face (services);
the pointer nudges the camera and the robot's head.

* `components/site/nova-hero.tsx` — the panels, the typing prompt box, the 10-tab services
  carousel, the right rail, and the still/pointer wiring.
* `components/site/nova-robot.ts` — the robot itself: rounded-box lathe of shells, a gradient
  face ring (canvas conic texture used as map + emissive map), a 512 px face canvas, PMREM
  `RoomEnvironment`, shadows. Loaded with a dynamic `import()`, so three.js is not in the first
  home bundle.
* `app/nova.css` — everything in this chapter.

**Degrades on purpose.** `prefers-reduced-motion` and low-power devices (≤ 4 GB or ≤ 4 cores)
get a single rendered frame instead of a render loop; if WebGL is unavailable the paper sheet is
still a complete composition. The site header turns ink-on-paper while it sits over the sheet
(`body[data-paper-hero]`).

The older **pill reveal** hero and the **readable belt** are kept in the repo but are no longer
mounted: `components/site/pill-hero.tsx` and `components/site/readable-belt.tsx`. Mount either in
`app/page.tsx` to bring it back.

### The "Application error" crash on navigation (fixed 2026-10-30)

Symptom: clicking any internal link from the home page (or from `/repairs`) after the page had been
scrolled threw **"Application error: a client-side exception has occurred"**, with
`NotFoundError: Failed to execute 'removeChild' on 'Node'` in the console.

Cause: two sections pin their own React-owned element with GSAP ScrollTrigger —
`featured-phones.tsx` (home) and `repair-atelier.tsx` (via `useGsap`, `/repairs`). ScrollTrigger
wraps a pinned element in a `.pin-spacer` div. Their cleanup ran in a **passive** `useEffect`, and
React's passive-effect cleanup fires *after* it has removed the host nodes — so React tried to
remove a section that was no longer a child of the parent it remembered.

Fix: `hooks/use-gsap.ts` now exports `useIsomorphicLayoutEffect`, and both pinning components clean
up in the **layout** phase (cleanup runs before React touches the DOM), calling
`ctx.revert()` / `mm.revert()` and then `ScrollTrigger.refresh()`. `ctx.revert()` also unwraps the
pin-spacer. Any future component that pins React-owned DOM must use the same hook.

Verified after the fix: 24 client-side hops across 12 routes, the original failing click sequence,
and scroll-all + mobile + tablet + reduced-motion passes — zero page errors, zero console errors.

### Custom cursor — removed (2026-10-30)

`components/ui/custom-cursor.tsx` (the peach trailing dot that ballooned into a labelled bubble —
DRAG / VIEW / CALL) is no longer mounted. `SiteChrome` stopped rendering it and the
`html.has-custom-cursor { cursor: none }` rule is gone from `app/globals.css`, so the native pointer
is back on every route. The `data-cursor="…"` attributes scattered through the site are now inert;
they were left in place so the component can be re-enabled from one line if it is ever wanted again.

### §1 — the curtain-split hero (2026-10-29, current)

The home hero is the 21st.dev **CurtainSplitHero**, rebuilt for F-Ex.

* `components/ui/curtain-split-hero.tsx` — eight shop photographs sit stacked in the middle like a
  closed curtain. Scrolling over the stage, clicking it, or tapping it parts them into two wings
  (a cubic ease on a framer-motion spring) and reveals the headline in the middle. Pointer parallax
  moves the wings in opposite directions; hovering a spread card lifts and straightens it.
* The split, the spring config, the wheel mapping and the card transforms are unchanged from the
  original component. What changed: the palette (`ink-deep` / `cream` / `peach` instead of
  stone), the copy, the eight images (all self-hosted shop photography, no CDN), and the frame —
  the original was a 430–510 px rounded card on a light page, this one is a full-height hero.
* The wheel listener is scoped to the stage and stops calling `preventDefault` once the curtain is
  fully open, so a normal scroll then carries you into §2. The stage carries `data-lenis-prevent`
  so Lenis leaves it alone.
* Mobile: the wings are narrower (62×84) and pushed further out (0.37 of the width), and the
  headline gets a soft `ink-deep/70` plate so it stays readable over the photographs.

The earlier paper-stage hero (`components/site/nova-hero.tsx` + `nova-robot.ts` + `app/nova.css`)
is still in the repo, unmounted. Mount it in `app/page.tsx` to bring the robot back.

### §2 — the CircularCarousel story ring (2026-10-29)

The services panel is now the React Bits **CircularCarousel** (JavaScript + CSS variant) holding
the six-chapter F-Ex story: The counter → Graded A → Sealed stock → Try, then pay → Forty minutes →
Bench rules.

* `components/site/circular-carousel.tsx` — the component, ported to TypeScript (the upstream
  variant is plain JSX; this codebase is strict TS, so props and state are typed and nothing
  behavioural changed). Its **only** edit beyond typing is that the default Unsplash sample photos
  were removed — `items` is required, which is what this shop wants anyway.
* `app/circular-carousel.css` — the component stylesheet, copied as shipped. Our overrides live in
  `app/nova.css` under `.nv-ring`.
* Props in use: `preset="cylinder"`, `intro="rise"`, `cardWidth={252}`, `aspectRatio={1.16}`,
  `speed={11}`, `fadeColor="#efece6"` (the paper, so distant cards dissolve into the sheet),
  `captions`, `parallax`, `snap`, `pauseOnHover`, `focusOnClick`.
* `onChange` drives the `01 / 06` counter; `onItemClick` routes to that chapter's page
  (`/branches`, `/second-hand`, `/new-phones`, `/emi-payments`, `/repairs`).

**Two integration notes worth keeping.** The ring's 3D children can escape a parent's depth
context, so the stage is `overflow: hidden; contain: paint` — without that the cards pushed the
document 36 px wide at 1440. And `prefers-reduced-motion` turns the ring's autoplay and intro off
at the component level, so the counter stays put.

### Home hero — the pill reveal (2026-10-29)

The hero is now the **F-EX wordmark that opens into a stadium-shaped window**: a hairline
between `F` and `EX` becomes a slit, a circle, then a 2:1 pill with the store's reel inside, and
the two halves are pushed apart as it grows.

* `components/site/pill-hero.tsx` — the timeline, the fallbacks, the replay control.
* `components/ui/…` — nothing new; the reel is a static file (§15).
* `scripts/build-hero-pill.sh` — regenerates the reel (see below).

**One timeline.** Every moving part is a Web Animation on its own element, all started in the
same tick, so nothing can drift. `DURATION = 2100 ms`, and each part is a `win(from, to)` window of
it:

| Part | Window | Property |
| --- | --- | --- |
| Pill width | 0 → 100 % | `0.012em` (hairline, held to 14 %) → `0.16em` (slit, 30 %) → `1.81em` (circle, 58 %) → `3.62em`, easings `.5,0,.3,1` / `.45,0,.3,1` / `.4,0,.2,1` |
| Pill clip | 0 → 14 % | `inset(40% 0)` → `inset(0)`: the hairline is drawn from the middle out |
| Hairline overlay | 14 → 30 % | opacity `1 → 0` — **on the overlay, never on the video** |
| Word gap | 0 → 100 % | `0.026em` → `0.05em` (58 %) → `0.085em`; the halves are pushed out by the growing pill |
| Paper + strokes | 45 → 78 % / 50 → 85 % | opacity |
| Site header (`.data-site-header`) | 50 → 86 % | `translateY(-140%) → 0`, `cubic-bezier(.2,.8,.2,1)` |
| Footer bar | 52 → 90 % | `translateY(160%) → 0` |
| Rule | 40 → 95 % | `scaleX(0) → 1`, origin centre |
| Icons | 80 → 100 % | opacity `0 → 0.85` |

Everything is sized from `--fs = min(19.6vh, 13.2vw)` (the font size of the word), so the whole
hero scales as one unit. Under 720 px `--fs = min(34vw, 16.5vh)` and the word **stacks** —
`F` over the pill over `EX` — and the pill opens **vertically** (`height: 1.5px → 10 % → 55 % →
100 %` of `(100vw − 40px) / 1.85`) instead of horizontally.

**F-Ex substitutions** (the brief was written for a fictional rental brand):

| Brief | F-Ex |
| --- | --- |
| word `WILD` with a hairline between I and L | `F` + `EX`: the hairline **is** the hyphen in F-EX |
| Poppins / white paper | Bodoni Moda 700 (the site's own wordmark face) + deep ink paper `#0F3040 → #081C27` |
| floating-island sunset clip | the store's own reel: phone macro → accessories → hand-held phone → repair bench |
| nav row in the hero | the **real site header** drops in (no duplicated nav) |
| footer button `Let's Get Wild` | peach pill `Play it again` — it reverses and replays the reveal |
| speaker icon (clip is silent) | play/pause for the reel — a mute toggle on a silent clip is a dead control |

**The reel.** `public/video/hero-pill.mp4` / `.webm` (1280×552, 13 s, no audio, 446 / 441 kB):
four real F-Ex photographs, each with a slow push/pan, cross-dissolved, then the whole sequence is
**mirrored and concatenated** so the loop point is a frame-perfect match — no crossfade, no jump.
Rebuild it with:

```bash
bash scripts/build-hero-pill.sh     # then re-encode the webm:
node_modules/ffmpeg-static/ffmpeg -i public/video/hero-pill.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 -an public/video/hero-pill.webm
```

It sits at `height: 100%` of the pill, `width: max(4.2em, 100%)`, `object-fit: cover;
object-position: center top`, always opaque — only the pill's width and clip reveal it.

**Fallback ladder**

1. `prefers-reduced-motion` → no timeline at all: the final state, reel paused on its poster.
2. JavaScript never runs → a `<noscript>` style block sets the same final state.
3. A resize mid-flight → every animation is cancelled and the final state is measured and applied.
4. The intro loader owns the first ~1.2 s, so the timeline **waits for it to unmount**
   (`MutationObserver` on `[role="status"]`), otherwise the whole reveal plays behind it.
5. `?rec=1` → the reveal at 0 s, the reverse collapse at 4.9 s, plus
   `window.__recVideo(t) => (t % duration) + 1/120` for frame-by-frame recording.

### Archived: the flying handset (2026-10-29, earlier the same day)

`components/site/flying-hero.tsx`, `components/ui/phone-flyer.ts` and
`components/ui/phone-three.ts` are **kept but no longer imported** — the pill hero above replaced
them on the home page. Mount `<FlyingHero />` in `app/page.tsx` to bring the 3D flight back.

### Archived: the 6-scene showcase

`components/ui/phone-showcase.tsx`, `components/site/home-showcase.tsx` and
`components/ui/PHONE-SHOWCASE.md` are **kept but no longer imported** — the flying hero above
supersedes them on the home page. Nothing references them, so they add nothing to the bundle
(`First Load JS shared by all` is unchanged at 87.3 kB). Delete all three if you want the tree
clean, or mount `PhoneShowcase` on `/about` if the scene-by-scene story is wanted back.

---

## 6. The 3D phone studio (archived showcase)

> Status: **not mounted on any route.** The home hero is `pill-hero.tsx` (§5). This chapter is
> kept because `phone-three.ts` is still the reference studio build and the code below explains
> the three.js decisions (extrusion bevels, UV normalisation, environment, lighting) that the
> flyer reuses.

`components/ui/phone-showcase.tsx` — the scroll-scrubbed stage (scroll, scenes, copy,
fallbacks) — and `components/ui/phone-three.ts` — the **three.js studio** that draws it.

The studio was originally hand-written raw WebGL (a single vertex + fragment shader). It is now
a real three.js scene: an extruded aluminium frame, a glass screen showing a live canvas-drawn
wallpaper, a camera island with three lens barrels, side keys, and internals that fly apart in
the Atelier scene, lit by a key/rim/fill rig plus a `PMREMGenerator`-filtered procedural
environment built from the palette.

* **Dependencies:** `three` (+ `@types/three`). Deliberately **not** `@react-three/fiber` —
  R3F adds a reconciler over the top for what is a fixed, imperative scene; the wrapper here is
  ~40 lines and the scene is built once. Nothing from `three/examples` is imported
  (`RoundedBoxGeometry` etc.), so there are no addon imports to break on upgrades: the phone is
  `Shape` + `ExtrudeGeometry`, the plates are `ShapeGeometry`.
* **Camera:** `KEYS` (landscape) and `KEYS_TALL` (portrait — the primary layout) hold six
  keyframes; `sceneCoord()` maps scroll progress to a continuous scene coordinate, `keyAt()`
  smoothsteps between keyframes, `HOLD` controls how long each scene sits. The component still
  computes the camera eye/target itself and hands them to three, which owns positioning,
  orientation and roll.
* **Backdrop — real geometry, no painted plane and no screen-space sprites:**
  - a **curved studio cove** (`CylinderGeometry`, `BackSide`, vertex-coloured) wrapping the scene
    at radius 17.5, so the environment has a horizon and shifts as the camera orbits;
  - an **instanced 3D bokeh field** — 58 glowing spheres (26 on mobile) in one draw call,
    scattered through a real volume with per-instance drift and a depth fade, so near and far
    motes parallax against each other;
  - a **glowing orb body** — a sphere with a custom centre-to-rim falloff shader
    (`glowSphereMaterial`), sitting behind the handset on the view axis.
  The old CSS `radial-gradient` spotlight and the two `Sprite`s are gone. The `feTurbulence` grain
  layer stays — it hides banding in the rendered gradient.
* **Materials:** `MeshStandardMaterial` for metal/glass/boards, `MeshPhysicalMaterial` with
  clearcoat for the screen cover and lens glass, `ACESFilmicToneMapping` output.
* **Interaction:** pointer tilt, idle spin, drag-to-spin, keyboard-focusable scene nav
  (arrow keys), IntersectionObserver pause, and a capability probe before anything mounts.
* **Phones and tablets show photography, not the model** (below `PORTRAIT_MAX = 1024`). A real
  handset in a real scene reads as a product; a rendered slab with a drawn wallpaper reads as a
  placeholder — and the tall narrow stage is exactly where the model looks worst and costs the
  most GPU. One photo per scene, self-hosted under `public/images`, with alpha-vignetted
  `public/mobile/scene-N-fade.webp` copies so each frame melts into the ink instead of sitting in
  a rectangle. A top-light / bottom-heavy scrim keeps the F·E·X letters and body copy legible
  over any frame. `ShowcaseSkeleton` paints the same cover photo immediately, so there is no
  layout shift and no CSS-drawn stand-in while the stage chunk loads.
* **Fallback ladder:** below 1024 px → per-scene photography (deliberate, not a fallback) ;
  desktop → WebGL2 ? three.js : 2D canvas ; `prefers-reduced-motion` → photography.
  A three.js renderer that fails to construct drops to the photography, never a broken canvas.
* **Integration:** loaded with `next/dynamic({ ssr: false })`, its own CSS-sticky stage (no
  GSAP pin), and scene nav calls the shared **Lenis** instance via `getLenis().scrollTo()`.
  three.js is downloaded **only** on `/` — verified by measuring JS requests on other routes.

### Bugs found porting raw WebGL → three.js

1. **The screen was buried inside the frame.** The extrusion bevel sits *outside* the plate
   depth, so the frame's front face is at `t/2 + bevel`, not `t/2`. The screen was placed at
   `t/2`, leaving the metal cap in front of it — the phone rendered as a blank slab. Layers are
   now positioned from one constant, `FRONT_Z`.
2. **The wallpaper tiled and drifted.** `ShapeGeometry` emits UVs equal to the shape's own
   coordinates (roughly −0.5…0.5), not 0…1, so a texture mapped onto it tiles. UVs are now
   remapped from the position bounding box (`normalizeUV()`).
3. **Five console errors on WebGL-less devices.** The render loop mounted once with the default
   `webgl` mode before the capability probe had run, so `THREE.WebGLRenderer` logged a
   context-creation failure before the fallback engaged. A `probed` flag now gates both loops —
   which also restored the 2D canvas fallback, since the premature `setMode('poster')` had been
   short-circuiting it.
4. **The first port looked "odd" next to the raw-WebGL build** — flagged by the client and
   confirmed by comparing screenshots. (a) The screen was lit like a UI mockup: bright peach app
   tiles on a pale field instead of near-black glass with the mark etched in. (b) The handset was
   framed ~12 % smaller and dead head-on, so it read as a printed card rather than an object.
   (c) The warm bloom had been cut to a weak wash. Fixes: dark glass at `emissiveIntensity 0.16`
   with tiles ghosted to ~0.03 alpha; a `FRAMING = 0.88` constant pulls every keyframe's orbit
   radius in to restore the crop; the cover keyframe sits off-axis with a resting yaw so the
   chamfer is always in view; the halo is anchored behind the handset along the camera axis each
   frame, because a fixed world position slid off the phone as soon as the camera orbited.
5. **The 3D backdrop had three depth bugs of its own.** (a) The glow orb at `-1.35` with radius
   ~1.55 was big enough that its near cap poked *in front of* the screen, glowing through it — it
   now sits at `-3.4` behind the handset. (b) The cove was only 34 units tall, so in the close-up
   scene its bottom rim entered frame as a hard horizon arc across the body copy — now 78 units,
   with the horizon gradient widened so it reads as light pooling behind the phone. (c) Bokeh
   built from `IcosahedronGeometry` with an `alphaMap` rendered as faceted grey pebbles with dark
   rings (the sphere UV mapping fought the map); they are now cheap spheres lit by the same
   falloff shader, at low strength so they never cost contrast on body copy. An oversized
   backdrop plane also showed its edge as a vertical seam before the cove replaced it.

Verified at 1280×800 across all six scenes (`docs/three-scene-1..6.png`), plus
`docs/fallback-2d.png`.

Full adaptation notes: [`components/ui/PHONE-SHOWCASE.md`](components/ui/PHONE-SHOWCASE.md).

---

## 7. Data models (`models/`)

| Model | Key fields |
| --- | --- |
| **Product** | name, slug, brand, category, accessoryType, price (null = "Call for price"), mrp, emiFrom, ram, storage, colors, condition grade, batteryHealth, warrantyMonths, images[], hoverImage, branches[], status (`available/reserved/sold`), featured, order, SEO fields |
| **Branch** | slug, name, address, phone, whatsapp, opensAt/closesAt, mapQuery, directionsLink, blurb, active |
| **Lead** | type (`enquiry/repair/reservation/sell/contact`), status (`new/contacted/won/lost/archived`), name, phone, email, message, product ref, deviceModel, repairType, photos[], condition, expectedPrice, branch, ipHash, emailSent |
| **Banner** | title, subtitle, eyebrow, image, cta, placement (`hero/marquee/offers/category`), tone, active, order, schedule window |
| **Testimonial** | name, location, rating, quote, purchase, branch, featured, order |
| **User** | name, email, password (bcrypt, `select: false`), role (`owner/branchStaff`), branch, active |

Indexes cover the catalogue queries (`category + status + price`), text search, lead recency
and phone lookups.

---

## 8. Admin panel — how staff update stock

Sign in at **`/admin/login`** (created by the seed: `SEED_OWNER_EMAIL` /
`SEED_OWNER_PASSWORD`).

**Daily stock routine**

1. **Products → + Add product**
   * Name, brand, category, price (leave blank to show *Call for price*), MRP, EMI.
   * RAM / storage / colour / condition grade / battery health / warranty.
   * Upload photos — **first image is the card**, second is used on hover.
   * Tick the branches that hold the unit, set status, optionally "Featured on home".
2. **Status changes** — from the products list, use the inline dropdown:
   * `available` → shown normally
   * `reserved` → rose "Reserved" ribbon on the card and product page
   * `sold` → greyed card with a "Sold" ribbon, still visible for SEO
3. **Leads** — every form submission lands here (and in the Resend email). Expand a row for
   photos and message, tap Call/WhatsApp, then move the status to *contacted → won/lost*.
   Filter by type/status/branch or free text, and **Export CSV** for the accountant.
4. **Banners & offers** — publish/hide the ticker offer and hero banners.
5. **Testimonials** — add only real reviews, feature/unfeature.
6. **Branches** (owner only) — fix a phone number or timing; the site updates in seconds.

Every write calls `revalidateTag('products' | 'leads' | 'banners' | ...)`, so the public site
reflects the change on the next request — no rebuild, no deploy.

**Roles** — `owner`: everything; `branchStaff`: products + leads for their branch
(enforced in middleware *and* re-checked inside each server action and page).

---

## 9. API surface

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/leads` | POST | public | single intake for contact / reservation / repair / sell (Zod + honeypot + rate limit) |
| `/api/search` | GET | public | debounced suggestions, 60 req/min/IP |
| `/api/upload/repair` | POST | public | Cloudinary upload for repair photos (≤5 MB, image types, 8/10 min) |
| `/api/upload/sign` | POST | staff | signed params for direct admin uploads |
| `/api/admin/export` | GET | staff | CSV of leads honouring the current filters |
| `/api/auth/[...nextauth]` | * | — | NextAuth |

---

## 10. Security, performance, SEO, accessibility

**Security** — Zod on every input (client + server), bcrypt (cost 12), NextAuth JWT sessions
(12h), middleware-protected `/admin`, owner-only branch edits, in-memory sliding-window rate
limits (5 leads / 10 min, 15 min block), honeypot fields, IPs hashed with a salt before storage,
Cloudinary secrets server-side only, CSP + HSTS + nosniff + frame/referrer policies in
`next.config.mjs`, no secrets in the client bundle.

**Performance** — server components by default; the 3D stage, GSAP ateliers and heavy motion
are dynamically imported; transform/opacity-only animations; images through `next/image` with
AVIF/WebP and explicit sizes; DPR capped at 1.5 on phones; IntersectionObserver pauses the
render loop; cached tagged reads; 60fps target with a still-poster path for low-end devices.

**SEO** — Metadata API with canonical URLs and OG/Twitter cards, `MobilePhoneStore` JSON-LD per
branch, `Product` + `BreadcrumbList` JSON-LD, `sitemap.xml` (static routes + branches +
products), `robots.txt` that blocks `/admin` and `/api`.

**Accessibility** — semantic landmarks, one `h1` per page, visible focus rings, skip link,
keyboard-focusable 3D scene nav with arrow keys, `aria-pressed` filters, alt text on product
images, labelled form controls with `role="alert"` errors, AA contrast per the palette rules,
reduced-motion honoured everywhere.

---

## 11. Deploy to Vercel

1. Push the repo to GitHub.
2. **Vercel → New Project → import**, framework auto-detected (Next.js).
3. Add environment variables (Production + Preview):
   `NEXT_PUBLIC_SITE_URL`, `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
   `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFY_EMAILS`, `NEXT_PUBLIC_GA_ID`,
   `RATE_LIMIT_SALT`.
4. **MongoDB Atlas** — allow Vercel egress (or `0.0.0.0/0`), create a database user, use the SRV
   string with `/fex?retryWrites=true&w=majority`.
5. **Cloudinary** — use the cloud name/API key/secret; the `fex/products` and `fex/repairs`
   folders are created automatically.
6. **Resend** — verify your sending domain, then set `RESEND_FROM_EMAIL` to that domain.
7. Seed once from your machine (`MONGODB_URI` pointing at production): `npm run seed`, then
   **change the owner password immediately** (or set `SEED_OWNER_PASSWORD` first).
8. Point the domain, verify `https://yourdomain/sitemap.xml`, submit to Google Search Console,
   and set the Google Business Profile links in `lib/config.ts`.

Rate limiting is in-memory: fine for a single-region store. If traffic grows, swap the store in
`lib/rate-limit.ts` for Upstash Redis — the interface is one function.

---

## 12. Verified in a real browser

### The pill hero (2026-10-29)

| Check | Result |
| --- | --- |
| Reveal, frame by frame | `docs/pill-reveal.png` (0 / 300 / 600 / 900 / 1200 / 1600 ms), captured by pausing and seeking the animations so the capture time is exact |
| Closed → slit → circle → stadium | pill `2 px → 30 px → 340 px → 681 px` wide, 341 px tall, halves pushed apart (`qa/pillframes.mjs`) |
| Reel | 1280×552 playing, `paused: false`, no media error; loops at 13 s with a frame-matched seam |
| `Play it again` | 681 → 302 → 681 px: reverses to the hairline and opens again (`qa/pillbehave.mjs`) |
| Play/pause icon | pauses and resumes the reel |
| 390 / 820 / 1200 / 1680 | `overflow: 0px` at every width; phone stacks F / pill / EX and opens vertically (`docs/pill-390.png`, `docs/pill-820.png`) |
| `prefers-reduced-motion` | final state, 0 animations, reel paused on its poster |
| Retina/QA note | headless Chromium has no H.264, which is why the `.webm` source exists — it is the only way to see the reel move in a test |

### The flying hero (2026-10-29, archived)

Checked at 1440×900, 1024×768, 768×1024 and 390×844 with headless Chromium (SwiftShader):

| Check | Result |
| --- | --- |
| Canvas mounts, first frame renders | `canvas.flyer-canvas.is-ready`, drawn at DPR 2 (`docs/flyer-1.png`, `docs/flyer-2.png`) |
| Flight across the sticky stage | pose + rotation change with scroll, 0 console errors (`qa/flyer.mjs`) |
| Exit hand-off | canvas opacity `1 → 0.02 → 0` once the stage releases; nothing floats over the sections below |
| 390 / 768 | canvas `display:none`, hero is the composed photo, `overflow 0px` (`docs/flyer-390.png`) |
| 1024 | canvas shown, no overlap with the copy column (`docs/flyer-1024.png`) |
| `prefers-reduced-motion` | canvas `display:none`, no rAF, hero still complete (`docs/flyer-reduced.png`) |
| no `webgl2` | probe exits, canvas stays at `opacity: 0`, zero errors (`docs/flyer-nogl.png`) |
| All routes | **ALL 14 ROUTES PASS**, zero console errors (`qa/audit.mjs`) |

Two look bugs found by screenshotting rather than guessing: the screen read **warm brown** (the
warm studio environment was being reflected off the glass — the environment is now deep teal with
one narrow peach band, and the screen's `envMapIntensity` dropped to `0.16`), and at 1024–1279 the
header wrapped the wordmark onto two lines (nav moved to `xl`).

The hero and every route were checked in headless Chromium (desktop 1440×900 and mobile
390×844 with touch + DPR 2):

* all 14 public/admin routes return 200 with **zero** console errors or page errors;
* the same build was loaded through a **preview-style host** (`3000-<id>.e2b.app` mapped to
  the dev server) to confirm the platform proxy origin works: 200, zero console errors, zero
  blocked requests, 23 images with none broken, and the WebGL stage still initialising
  (`docs/dev-preview-host.png`);
* the WebGL stage initialises, the phone renders, and all six scenes scrub correctly
  (`docs/hero-desktop.png`, `docs/showcase-mobile-scenes.png`);
* mobile correctly switches to the poster path on a low-end profile (2 cores → no WebGL);
* `next build` and `tsc --noEmit` are clean.

Three bugs found and fixed during that pass, worth knowing about:

1. **Blank hero (white page).** `gl.createShader()` returns `null` after a lost context, and the
   old code passed that `null` straight into `shaderSource()` → uncaught `TypeError` → React
   error boundary wiped the hero. React StrictMode's double-mount was enough to trigger it.
   Every GL call is now null-guarded, and a context/shader failure falls back to the poster
   frame. The cleanup no longer calls `loseContext()` (a canvas cannot be re-initialised after
   that — which is the second half of why it stayed blank).
2. **Mirrored, hollow wordmark.** The lock-screen texture is now opaque and drawn with the
   canvas's downward Y-axis, and `uv.y` is flipped when sampling it in the shader.
3. **Words ran together** in letter/line reveals ("Comeholdit") — trailing spaces inside an
   `overflow-hidden inline-block` are trimmed by CSS, so word gaps now come from padding. The
   first fix only covered `mode="words"`, which is why the CTA (rendered with `mode="lines"`,
   where the units are *also* words) still collapsed; the padding now applies to every mode
   except `letters`.

### Media pass (2026-10-28)

Re-verified after every photograph and clip was moved off the stock CDNs and into `public/`:

* all 14 routes still return 200 with zero console errors, and the **only** third-party hosts
  left in the network log are the Google Maps embed (`components/site/branch-map.tsx`, which in
  turn pulls `maps.gstatic.com` / `maps.googleapis.com`, and on `/branches/[slug]` also
  `fonts.googleapis.com` from inside that iframe). Nothing of ours is fetched remotely: the three
  typefaces come from `next/font/google`, which self-hosts them at build time, so no page issues
  a Google Fonts request of its own;
* no request to `images.unsplash.com` remains — every `<img>`, `next/image` source, poster and
  `<video>` resolves to `/images/…` or `/video/…` (screenshots: `docs/cta-desktop.png`,
  `docs/cta-mobile.png`, `docs/repairs-band.png`, `docs/repairs-strip.png`,
  `docs/about-band.png`);
* four more bugs found and fixed in this pass:
  1. the video bed was laid out **in flow** instead of absolutely positioned, which pushed the
     CTA headline down the page — it is `absolute inset-0` now;
  2. the CTA scrims were so heavy the footage was invisible; they are tuned so the opened phone
     still reads while the headline stays AA;
  3. word gaps regressed for `mode="lines"` (see above);
  4. `duration-[1200ms]` is ambiguous in Tailwind and warned on every build — now `duration-1000`.

The headless Chromium used for QA ships without proprietary H.264, so it aborts the `.mp4`
fetches and paints the poster frame instead. That is exactly the fallback path
`prefers-reduced-motion` users get, and it renders correctly — the clips themselves were verified
to decode (`ffmpeg -f null -`) at 9 s, 25 fps, H.264 High, yuv420p, faststart.

## 13. Responsive

Mobile-first, verified at **320 / 360 / 390 / 414 / 480 / 640 / 768 / 820 / 1024 / 1280 / 1440 /
1920 / 2560 px**, plus tablet (820×1180, 1024×768) and a landscape phone (740×360).

### Breakpoint contract

> **Changed 2026-10-29:** the desktop nav now appears at `xl` (1280), not `lg` (1024). At 1024–1279
> the eight nav labels plus the sell/call pills overflowed and wrapped the wordmark onto two lines
> (reproduced on every route). Below 1280 the header shows the search, sell and call pills plus the
> hamburger sheet, and the mobile action bar stays visible to 1024. `whitespace-nowrap` + `shrink-0`
> on the wordmark and pills stop the squeeze.


| Range | Layout |
| --- | --- |
| < 640 (`sm`) | single column, 20px gutters, stacked cards |
| 640–1023 | two-up grids, condensed meta rows |
| ≥ 1024 (`lg`) | side-by-side compositions, full desktop nav |

The 3D showcase uses its own cutover: **below 1024 px** it runs the stacked portrait
composition with `KEYS_TALL` camera framing; **at or above** it runs the flanking layout with
`KEYS`. That cutover is defined once as `PORTRAIT_MAX = 1024` in
`components/site/flying-hero.tsx` (`PORTRAIT_MAX`-style gate) and **must stay equal to the `lg` Tailwind breakpoint** —
when the two disagreed (CSS at 1024, JS at 820) the tablet range rendered desktop framing
against portrait copy and the phone sat on top of the text.

### Rules that keep it honest

* **No horizontal overflow anywhere** — asserted at all 13 widths on every route by walking each
  page to the bottom and comparing `scrollWidth` to `clientWidth`.
* **Portrait legibility band** — the showcase draws a single gradient scrim behind all six
  scenes below `lg`; scenes park copy in the lower half and the camera keys push the handset into
  the upper half (`target.y` negative lifts it). Scene-4 type scales `10.5vw → 12vw → 7vw` so
  "Motherboard" never clips at 320 px.
* **Short viewports** (`max-height: 560px`, i.e. landscape phones) get their own media queries:
  the giant flanking wordmark is hidden, copy tightens, and the poster switches to `contain`.
* **Touch targets** — text-style links (breadcrumbs, "read more", inline phone numbers) use the
  `.tap-sm` / `.tap` utilities in `app/globals.css`, which add hit area with `min-height` without
  shifting the text baseline. Form fields are all ≥ 44 px.
* **Reduced-motion / no-WebGL** — the poster is a *portrait* frame, so it is `object-contain`
  (never cropped into a wall of bezel) and a pre-feathered copy
  (`public/showcase-poster-fade.webp`, 72 KB alpha vignette) lets it melt into the stage. The
  plain JPEG remains as the fallback.

### Bugs found while making it responsive

Three of these were **invisible before the chrome was restored**, because the components that
contained them were never rendering at all:

1. **The entire public chrome was dead code.** `components/layout/site-chrome.tsx` (header,
   footer, mobile action bar, loader, scroll progress, custom cursor, section counter) was
   defined but never mounted — `app/layout.tsx` rendered `{children}` and nothing else, so the
   site shipped with no navigation at all. It is now mounted through
   `components/layout/chrome-gate.tsx`, which skips `/admin/**` so the panel keeps its own calm
   shell.
2. **The cinematic loader never dismissed.** `useReducedMotion()` returns `boolean | null`; using
   that directly as an effect dependency re-ran the mount effect, and its cleanup cleared the
   dismiss timer while the overlay stayed mounted — a permanent full-screen cover. Under
   StrictMode's double-invoke the second pass then bailed out early (session key already set),
   losing the timer entirely. The loader now decides once (`started` ref) and dismissal is driven
   by state in its own effect, so a timer exists whenever the overlay is on screen.
3. **Hydration mismatch under `prefers-reduced-motion`.** Ten components imported
   `useReducedMotion` from Framer Motion, which reads the media query during render: the server
   emitted the animated markup (motion off on the server) and a reduced-motion client rendered the
   static fallback, so React threw away and re-rendered the whole tree. Every component now uses
   the SSR-safe `hooks/use-reduced-motion.ts` (always `false` on the first render, corrected in an
   effect), which five components already used.
4. **The cinematic loader was replaced by a typographic one** (client request, 2026-10-28): bold
   Bodoni `F-EX` lifting letter-by-letter out of a clipping mask, a peach `000 → 100` counter in
   the corner, and a single wipe-up exit — 1150 ms total instead of 2350 ms. The counter and the
   bottom hairline are driven by one rAF loop writing to refs, not React state, so the ~60
   updates/second never cause a re-render. The robustness rules from the old loader are unchanged
   (decide once via `started` ref, dismissal owned by state in its own effect).
4. **Invalid nested anchors in the footer** — the branch phone `<a>` sat inside the branch
   `<Link>`, which is invalid HTML and broke hydration the moment the footer actually rendered.
5. **Branch card meta row** broke the phone number mid-digit ("+91 85118 / 22537") on narrow
   screens; hours and phone now stack below 640 px and never wrap internally.
6. **Showcase copy over the handset** — see the breakpoint contract above.
7. **The admin sidebar had no sign-out on a phone.** The user block (name, role, sign out) is a
   `lg:block` column, so below 1024 px staff could sign in but never out — the only sign-out
   control in the panel was off-screen. There is now a 36 px icon button (aria-label "Sign out")
   in the sidebar header, visible below `lg` only, and the nav links moved from `py-2.5` to
   `py-3` below `lg` so every tap target clears 40 px.
8. **Escape did not close the mobile drawer**, and because the drawer scroll-locks `<html>` it
   left the page frozen behind a full-screen overlay with no way out for a keyboard user
   (`openAfterEsc: true`, `overflowAfterEsc: 'hidden'`). The drawer is hand-rolled rather than
   Radix, so it does not inherit a focus trap or an Escape handler. `Header` now keeps
   `menuButtonRef` / `closeButtonRef` and a second effect on `[menuOpen]` that binds `keydown`
   → Escape → close, moves focus to the close button, and returns it to the hamburger on cleanup
   (so the lock is always released through the same path as a click).
9. **The four "departments" cards never finished their entrance — they stayed permanently
   blurred and 0.8 % small.** `category-stack.tsx` drove scale/blur/rotate from
   `useScroll({ target: ref, offset: ['start end', 'start start'] })` on an element that is itself
   `position: sticky`. Framer measures the *live* rect, and a sticky element's `top` stops at its
   sticky offset (84/102/120/138 px), so it can never reach the `"start start"` target: progress
   froze around 0.9 and every locked card sat at `blur(0.59px)`, `scale(0.992)` forever. Measured
   before the fix at 1280×860 — all four cards reported `blur=0.59px sc=0.992` while pinned.
   Progress is now measured against the pin offset itself (`usePinProgress`, one rAF-throttled
   scroll listener per card, `0` = card top at the viewport bottom, `1` = locked), so it lands on
   exactly 1 and the effects reach clean values. Pin offsets live in one place — `PIN_BASE` /
   `PIN_GAP` / `pinTopFor()` — and must stay in sync with the `top` style.
10. **The same section was frozen at `blur(6px)` under `prefers-reduced-motion`.** Passing
    `style={undefined}` when reduced did not neutralise the entrance values; it left them at the
    `[0]` end of the transform, permanently blurred. The hook now sets progress to `1` when motion
    is reduced and the motion values are always applied, so the static state is the sharp one.

### Admin shell at narrow widths

`/admin/**` never mounts the public chrome (`chrome-gate.tsx`), so the panel has its own shell:
a full-width Deep Teal bar that stacks above the content below 1024 px and becomes a 256 px
sticky column at `lg`. Below `lg` the nav is a single horizontally scrolling row — six links,
three in view at 320–390 px — and everything below it is the page body.

Because the dashboard layout re-checks `getServerSession` and redirects without one, and there
is no MongoDB in this environment, the authenticated shell was verified by rendering
`AdminSidebar` in a throwaway route that reproduced the dashboard wrapper (the route was
deleted afterwards — it is not part of the app). Measured with `reducedMotion` on:

| Width | Page overflow | Aside | Nav | Link height | Sign-out |
| --- | --- | --- | --- | --- | --- |
| 320 | 0 | 320 × 125 stacked | scrolls 399 px, 3 of 6 in view | 40 px | 1 |
| 360 | 0 | 360 × 125 stacked | scrolls 359 px, 3 of 6 in view | 40 px | 1 |
| 390 | 0 | 390 × 125 stacked | scrolls 329 px, 3 of 6 in view | 40 px | 1 |
| 768 | 0 | 768 × 125 stacked | no scroll, 6 of 6 | 40 px | 1 |
| 1024 | 0 | 256 × 800 sticky column | no scroll, 6 of 6 | 36 px | 1 (bottom block) |
| 1440 | 0 | 256 × 800 sticky column | no scroll, 6 of 6 | 36 px | 1 (bottom block) |

Six console errors: none — `errs: 0` at every width. What this does **not** cover: a real signed-in
session, the data tables inside each panel page, or the forms (they need `MONGODB_URI`). Those
are untested in a browser, and the mobile one-column table behaviour is therefore a code-level
claim, not a verified one.

## 14. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| The hero is frozen closed (or frozen open) | The timeline is all-or-nothing: if one animation throws, cancel and call `applyFinal()` in `pill-hero.tsx` instead of leaving elements mid-keyframe. Reduced motion and `<noscript>` both land on the same final state. |
| The reveal plays but nobody sees it | The site's intro loader covers the first ~1.2 s. The hero waits for `[role="status"]` to leave the DOM; if that selector changes, the reveal starts behind the loader. |
| The pill's video shows only its poster | The browser refused the file. Chrome/Firefox take the VP9 `.webm`; Safari falls back to the H.264 `.mp4`. Both are committed — a missing `.webm` is the usual cause. |
| The reel jumps every 13 s | `hero-pill.mp4` is mirrored (forward + reversed) so the last frame equals the first. Re-cutting it with `-t` instead of the script breaks that. |
| The footer copy overlaps the action bar on tablets | The site's action bar is `fixed` and visible below 1024 px, so the hero footer carries `padding-bottom: 84px` at those widths. |
| A drop cap collides with the second line | The cap's `line-height` must contain the glyph (Bodoni's ascender overflows a sub-1 box) and its `margin-right` is in the *cap's* em, not the paragraph's. |
| The phone never appears on desktop | Check `canvas.flyer-canvas` has class `is-ready` — it is added only after the dynamic `phone-flyer` chunk resolves *and* the renderer is created. A blocked chunk or a failed `webgl2` probe leaves it at `opacity: 0`. |
| The phone sits on top of body copy further down the page | It shouldn't — the canvas fades to 0 as the hero stage releases. If you lengthen `KEYS`/the section height, keep the exit hand-off (`canvas.style.opacity`) in `flying-hero.tsx`. |
| The handset's screen looks brown/mauve instead of dark glass | The procedural environment is being reflected off the glass. Keep the env deep teal (one narrow peach band) and `screen` `envMapIntensity` low (`0.16`); a warm env at high intensity turns the etched screen bronze. |
| `404` on `/_next/static/chunks/webpack-<hash>.js` on one or two ISR routes (`/branches/*`) after a rebuild | Stale prerendered HTML referencing the previous build's chunk names. `rm -rf .next && npx next build` — the full-route cache is reused across local builds, Vercel never hits this. |
| Mobile hero shows a photo, not the 3D phone | Intentional: below `PORTRAIT_MAX = 1024` the hero is real photography, one frame per scene. See §6. |
| Hero is a flat 2D drawing instead of the 3D phone | The page has no WebGL2 (the cap that creates the `webgl2` probe context failed). three.js r163+ is WebGL2-only, so it falls to the hand-drawn 2D canvas. See `docs/fallback-2d.png`. |
| `THREE.WebGLRenderer: A WebGL context could not be created` in the console | The capability probe did not gate the render loop, so three.js mounted on a device without WebGL2. Check the `probed` flag in `phone-showcase.tsx`. |
| The phone renders as a blank metal slab | The screen is sitting behind the frame's bevelled front face. Positions must derive from `FRONT_Z` (`t/2 + bevel`), not `t/2`. |
| A texture on a three.js `ShapeGeometry` tiles or looks off-centre | `ShapeGeometry` UVs are the shape's own coordinates, not 0…1. Run them through `normalizeUV()` in `phone-three.ts`. |
| Everything renders but all photos are missing | Only possible with admin-uploaded Cloudinary URLs (remote). All bundled photography and video is self-hosted under `public/`, so it renders offline. See §15. |
| `/api/leads` returns `{ ok: true, preview: true }` | No `MONGODB_URI` — the form accepted the request but did not persist it. |
| Admin shows "No database connected" | Same: set `MONGODB_URI` and run `npm run seed`. |
| A video shows its poster and never plays | `prefers-reduced-motion: reduce`, Data Saver, or a browser build without H.264. Intentional — every bed is designed to read as a still. |
| Header / footer / mobile action bar missing on every page | `components/layout/chrome-gate.tsx` was removed from `app/layout.tsx`. Without it the site renders pages with no navigation (this shipped broken once — see §13). |
| A full-screen loader covers the site forever | The intro overlay lost its dismiss timer. It must own a timer whenever it is visible; see the `Loader` notes in §13. |
| The intro never appears on a second visit | It is per-session by design (`sessionStorage['fex-intro-seen']`), and it is skipped entirely under `prefers-reduced-motion`. Clear the key or open a private window to see it again. |
| The loader counter is stuck at `000` | The rAF loop drives the text through refs, not React state. If `counterRef`/`barRef` lose their refs the numbers freeze while the timer still fires. |
| A sticky/pinned element animates "almost" into place and never finishes (permanently soft, slightly scaled) | Its `useScroll` offset targets a position a sticky element can't reach — e.g. `['start end', 'start start']` on the sticky element itself. Measure against the element's own sticky `top` instead; see `usePinProgress` in `components/site/category-stack.tsx` and §13. |
| A section is stuck blurred when the OS has reduce-motion on | Reduced motion was handled by dropping the `style` prop, which leaves the entrance values in place. Set the motion value to its final state instead — it must be applied, not omitted. |
| No way to sign out of the admin panel on a phone | The icon button in the sidebar header is `lg:hidden`; if it was removed, only the desktop user block remains. See §13. |
| Mobile menu is open and the page will not scroll | Expected while the drawer is open — it locks `<html>` overflow. Close with the X, the backdrop, Escape, or by picking a link; every path releases the lock. If Escape leaves it stuck, the `keydown` effect in `components/layout/header.tsx` was removed (it is hand-rolled, not Radix — see §13). |
| React logs "Hydration failed" on first load | A component branched its markup on `useReducedMotion` imported from `framer-motion`. Use `hooks/use-reduced-motion.ts` (SSR-safe) instead — §13. |
| Video not in the repo / 404 on a fresh clone | `public/video` and `public/images` are committed; check your clone did not use a sparse checkout or an LFS-smudge that skipped them. |
| `next dev` dies silently in the middle of a test run ("ERR_CONNECTION_REFUSED", blank log tail) | **OOM.** This box has 2 GB and no swap; `next-server` reached 1.24 GB RSS while compiling every route on demand and the kernel killed it (`dmesg \| grep -i oom` confirms). Don't chase it as a code bug. For any multi-route sweep, build once (`NODE_OPTIONS=--max-old-space-size=1536 npx next build`) and serve `NODE_OPTIONS=--max-old-space-size=1024 npx next start -H 0.0.0.0 -p 3000` instead — every route then answers in 5–85 ms with no compilation. |
| `node_modules` is missing after reopening the project | Dependencies are excluded from workspace snapshots. Run `npm ci` (~23 s from the lockfile), then restart the server. `ffmpeg-static` comes back with it. |
| The QA browser is missing after reopening the project | `~/.cache/ms-playwright` and `~/.local/chromelibs` are outside the snapshot too. Re-run `node node_modules/playwright-core/cli.js install chromium-headless-shell`, then re-extract the nine missing `.so` packages with `apt-get download libxdamage1 libasound2t64 libatk1.0-0t64 libatk-bridge2.0-0t64 libatspi2.0-0t64 libnspr4 libnss3 libxkbcommon0` and `dpkg -x` each into `~/.local/chromelibs`. Check with `ldd …/headless_shell \| grep -c "not found"` → must be `0`. The harnesses live in `qa/` (`audit.mjs`, `shot.mjs`) — `/tmp` is wiped between sessions. |
| Dev log repeats `Cross origin request … allowedDevOrigins` | Only appears if `allowedDevOrigins` in `next.config.mjs` is removed. Setting that option switches Next from *warn* to *block*, so it must list every host the dev server is reached by — currently `*.e2b.app`, `127.0.0.1`, `[::1]`. |
| `next start` warns the optional `sharp` package is missing | Production image optimization then falls back to the slow JS encoder. `sharp` is now a dependency (`npm i sharp`), so it is used automatically on Vercel and locally. |

## 15. Photography & video (self-hosted, real footage)

Everything the storefront renders is a real photograph or a real clip, served from `public/`.
No part of the site hotlinks a stock CDN at runtime — the previous Unsplash URLs were replaced
so the site renders identically offline, inside a sandboxed preview iframe, and on Vercel.

```
public/images/   29 JPEGs (1400 px wide, q75)   ~4.7 MB total
public/video/    3 H.264 loops + 3 poster JPEGs ~1.5 MB total
```

### What is where

| File | Used by | What it shows |
| --- | --- | --- |
| `images/store-interior.jpg` | `/about`, `/branches` hero, Lokhra card | Phone-store display floor |
| `images/repair-macro.jpg` | `/repairs` hero, home category card | Screwdriver on an opened phone |
| `video/hero-pill.mp4` \| `.webm` \| `.jpg` | **not on any route** — the reel for the retired pill hero (§5) | 13 s silent loop, 1280×552, built from four self-hosted store photographs with slow pushes and crossfades, warm grade; WebM (VP9) first, then H.264 |
| `images/repair-artisan.jpg` | `/repairs` bench strip | Technician lifting a screen |
| `images/repair-microscope.jpg` | `/repairs` bench strip | Board work under the stereo scope |
| `images/repair-teardown.jpg` | `/repairs` bench strip | Board, battery and screen laid out |
| `images/accessories-flatlay.jpg` | accessory products | Headphones + phone flat-lay |
| `images/accessories-audio.jpg` | earphone product hover | AirPods + iPhone on dark |
| `images/photo-<id>.jpg` | catalogue (12 products, banners) | Product and counter photography |

| Clip | Used by | Length / size |
| --- | --- | --- |
| `video/teardown.mp4` | home **final CTA** background | 9 s · 1280×720 · 415 KB |
| `video/repair-bench.mp4` | `/repairs` media band (portrait) | 9 s · 720×1280 · 476 KB |
| `video/atelier.mp4` | `/about` media band | 9 s · 1280×720 · 395 KB |

Each clip ships a same-named `.jpg` poster (a real frame from the clip).

### `components/ui/video-loop.tsx`

A single client component renders every loop:

* `muted loop playsInline preload="metadata"` — no audio track at all, so it never blocks the
  main thread with decode of an audio stream;
* **`IntersectionObserver`** — playback starts at 20 % visibility and pauses when the clip
  leaves the viewport or the tab is hidden;
* **`prefers-reduced-motion: reduce`** and **Data Saver** keep the poster frame and never call
  `play()` (the OS setting is also watched for live changes);
* the poster is painted underneath the video, so the first paint is always a photograph —
  a slow connection sees the still, not a black rectangle;
* decorative by default (`aria-hidden`, `tabIndex={-1}`); pass `label` only when the clip
  carries meaning.

### Replacing a photo or clip

1. Drop the new file into `public/images/` or `public/video/` using the same name (or add a new
   one and update the reference). Keep posters next to their clip.
2. Product and banner photography is referenced from `lib/demo-data.ts`, `lib/queries.ts` and
   `scripts/seed.ts`; branch photography from `lib/config.ts`. Re-run `npm run seed` to push new
   product images into MongoDB, or upload through **Admin → Products** (Cloudinary).
3. Keep the file under ~500 KB. Transcoded with the bundled static ffmpeg:

```bash
FF=$(node -e "console.log(require('ffmpeg-static'))")

# 8-second, muted, 720p H.264 loop — CRF 30 is indistinguishable at these sizes
$FF -ss 2 -t 8 -i source.mov -an \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=25" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 30 -preset slow \
  -movflags +faststart public/video/new-loop.mp4

# poster: a real frame from the loop, not a separate photo
$FF -ss 3 -i public/video/new-loop.mp4 -frames:v 1 -q:v 4 public/video/new-loop.jpg
```

### Licences

* **Unsplash** photographs — Unsplash Licence (free for commercial use, no attribution required;
  credit appreciated). Kept in `public/images` so the licence travels with the repo.
* **Pexels** photographs and footage — Pexels Licence (free for commercial use, no attribution
  required; credit appreciated). Clip source IDs: `6754816` (teardown), `6755165`
  (micro-soldering), `6754817` (atelier), photos `11297769`, `6755075`, `6755056`, `31862953`,
  `10568286`, `32912404`, `18533790`.
* Both licences allow modification; the loops here are cropped, trimmed and re-encoded.
* Replace the placeholder photography with real photographs of the two Guwahati branches and the
  actual bench before launch — that is the single biggest credibility upgrade left (see §15).

## 16. Before launch — TODOs in `lib/config.ts`

* `site.url` — real domain.
* `site.phone` / `site.whatsapp` — confirm the primary sales line.
* `site.email` — real inbox.
* Basistha phone number (currently `+910000000000` placeholder) + its own WhatsApp.
* `site.socials` (Instagram, Facebook) and `site.googleReviewsUrl` per branch.
* Verify both `geo` pins against Google Maps.

All of these are marked `TODO` in the file and drive the header, footer, sticky mobile bar,
WhatsApp deep links, JSON-LD and both branch pages — change them once.

## 17. Known limitations / phase 2

* **Sell / Exchange** is intentionally a "coming soon" page with an early-access list; counter
  exchanges are already handled manually (leads of type `sell`).
* No online payments — payments happen in store (cash / UPI / cards / EMI), by design.
* No cart or checkout: this is a dealership, enquiry + reservation is the conversion path.
* Testimonials are admin-curated (no public submission) to stay honest.
* 3D stage renders a poster instead of WebGL for `prefers-reduced-motion` and low-end phones.
# F-Ex-2
