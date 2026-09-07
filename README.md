# Lynkrs

The Lynkrs agency site: a 3D spatial journey rendered to WebGL, shipped as a PWA
on GitHub Pages.

**Live:** https://bob-elhasan.github.io/Lynkrs-Website/

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, build, SSR-build, then prerender every route |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over `src/` |

## What this is

The site is one continuous 3D corridor. The company narrative — the 01–07
story — is laid out as nine **stations** in that space, and scrolling flies the
camera along a Catmull-Rom spline through them. Routes are named waypoints on
the same spline, so `/bundles` flies to the Growth Suite station rather than
swapping a page.

| Station | Content |
| --- | --- |
| Arrival | "Growth is designed, not guessed" |
| 01 The problem | Four costs, with shards pulling apart as you approach |
| 02 Our positioning | The same shards converge into one lit system |
| 03 How we think | Four principles |
| 04 How we work | The five steps, lighting as they are reached |
| 05 The Growth Suite | Diagnostics, Launchpad, Accelerate, Scale |
| 06 What we run | M/01–M/04, each a door into its service page |
| 07 Together | The partnership model |
| Contact | The invitation; the form itself is DOM |

## The SEO and accessibility tradeoff — read this first

**The visible site renders to a WebGL canvas. Canvas content cannot be crawled
by search engines or read by screen readers.** That was a deliberate choice.

What compensates for it: every route is **prerendered to real semantic HTML** at
build time from the same content layer the 3D scenes use. That markup ships in
each route's `index.html` before any JavaScript runs, so crawlers and assistive
technology get the full copy. It is also what renders visibly when WebGL is
unavailable.

**Content parity between the 3D stations and the DOM mirror is a rule, not a
nicety.** They must always say the same thing. Divergence would be cloaking, and
would break the accessible experience. Both read from `src/content/`, which is
why that layer exists.

Verify it any time:

```bash
npm run build
grep -o "Visibility that keeps paying" dist/services/seo/index.html
```

## Architecture

```
src/
  content/          all copy, one file per domain — the single source of truth
  xr/
    stage.tsx       flat (R3F) vs immersive (IWSDK) mode selection
    xr-world-stage.tsx  the IWSDK world, lazily loaded
    world.ts        IWSDK bootstrap
    scene.tsx       the whole corridor, lights, fog, starfield
    rig.tsx         scroll and route -> camera position on the spline
    spline.ts       the journey path and its stations
    motion.ts       shared easing and duration tokens
    quality.ts      device capability tiers and WebGL detection
    stations/       one file per station
    ui/panel.tsx    3D typography (drei/troika)
  components/
    mirror/         the DOM mirror — semantic HTML for crawlers and a11y
    ui/             58 shadcn-style primitives (Watermelon)
    motion-primitives/  33 animated components (ibelick)
  pages/            one file per route, rendering the mirror
  prerender-entry.tsx  build-time static rendering
scripts/prerender.mjs  writes the mirror into every route's index.html
vendor/             both upstream repos, kept as reference source
```

### Flat and immersive paths

`@iwsdk/core` powers the WebXR path only, behind a lazy import triggered by the
"Enter in VR" button — which appears solely when `navigator.xr` reports an
immersive session is supported. Everyone else gets the same 3D corridor through
React Three Fiber's own renderer.

That split is not arbitrary. Measured on this scene:

| 3D bundle | raw | gzip |
| --- | --- | --- |
| with `@iwsdk/core` in the flat path | 13,959 kB | 6,102 kB |
| without it | 1,355 kB | 556 kB |

The `@iwsdk/core` barrel re-exports every subsystem it ships — Havok physics,
scene understanding, depth sensing, MCP tooling, the UIKitML parser — and they
self-register, so none of it tree-shakes. It also pulls in ~6.9 MB of three.js
addons. Charging every visitor 5.5 MB for physics a scroll journey never calls
is not a trade worth making, so the headset path pays for headset features.

**Do not add `three`, `@react-three/*` or `@iwsdk/*` to `manualChunks` in
`vite.config.ts`.** Naming a shared 3D chunk is exactly what forces the IWSDK
dependencies back into the flat path.

### 3D typography

drei's troika `<Text>`, not `@react-three/uikit`: uikit declares
`@react-three/fiber >=8` but is built against the v8 reconciler and throws on
v9, which React 19 requires.

Troika cannot parse woff2, so `public/fonts/` holds **static single-weight
Archivo TTFs** (400 and 600, 224 kB together, against 1,535 kB for the variable
Archivo and Inter files). The DOM mirror still uses the full
Inter/Archivo/Caveat woff2 set through fontsource.

Type sizes in `src/xr/ui/panel.tsx` are set for the ~14 world-unit viewing
distance the spline puts the camera at. Change the station spacing in
`spline.ts` and they need revisiting.

## Editing the site

**Copy** lives in `src/content/`. `journey.ts` holds the 01–07 narrative,
`services.ts` the four modules, `bundles.ts` the Growth Suite, `method.ts` the
five steps, `portfolio.ts` the case studies.

The voice is plain, warm, second person, British English, short declaratives —
*"You're busy running the business. We run the growth."* Anything added should
match it.

**Rebranding** is the token block at the top of `src/index.css`. Everything
resolves back to it:

```css
--brand:      oklch(0.55 0.11 250);   /* #3970B6 — the light source */
--brand-deep: oklch(0.28 0.05 235);   /* #0D2C3E navy */
--brand-gold: oklch(0.84 0.17 105);   /* #CDCD00 — kept rare */
```

`src/xr/palette.ts` mirrors these for the 3D scenes; change both together.

## Deploying

Pushing to `main` or `claude/website-repo-setup-85amtk` triggers
`.github/workflows/deploy.yml`, which typechecks, lints, builds and publishes to
GitHub Pages.

**One-time setup:** repository Settings → Pages → Source: **GitHub Actions**.

Moving to a custom domain: set `VITE_BASE=/` and `VITE_SITE_URL`, add
`public/CNAME`, and point DNS at GitHub.

### Environment

Copy `.env.example` to `.env`. All optional.

| Variable | Effect |
| --- | --- |
| `VITE_SITE_URL` | Origin for canonical links and OG tags |
| `VITE_BASE` | Vite base path (default `/Lynkrs-Website/`) |
| `VITE_CONTACT_ENDPOINT` | Where the lead form POSTs. Unset, it falls back to a `mailto:` handoff so an enquiry is never dropped |

## Before launch

- [ ] **Replace the portfolio placeholders.** Every entry in
      `src/content/portfolio.ts` is prefixed `PLACEHOLDER —`. Neither the company
      profile nor the existing site contained a single client name, logo or
      metric, so none were invented
- [ ] **Review the consultancy positioning.** `/services/consultancy` is
      assembled from the Growth Diagnostics audits, the five-step method and the
      partnership model. The *fractional CMO* framing was added and is not from
      your source material — keep it or cut it
- [ ] Point `VITE_CONTACT_ENDPOINT` at a real form handler
- [ ] Add an OG image and pass it to `<Seo image="..." />` (currently falls back
      to the app icon)
- [ ] Generate a `sitemap.xml` — `public/robots.txt` already references one
- [ ] Confirm `info@lynkrs.com` and the address in `src/content/site.ts`

## Notes on the ported components

`vendor/` holds both upstream repos at full source, git history stripped, as
reference. `src/index.css` carries `@source not '../vendor'` so Tailwind does
not scan them — without it the CSS bundle quadruples.

The ported components needed fixes for React 19 / Motion 12 / strict TypeScript:
type-only imports, `React.JSX.IntrinsicElements` (the global `JSX` namespace is
gone), annotated transitions, `useClickOutside` taking `RefObject<T | null>`,
and `InView` passing `once` to `useInView` rather than latching on animation
completion. ESLint holds `src/components/ui`, `src/components/motion-primitives`
and `src/hooks` to a softer bar than code written here — see `eslint.config.js`.

Both upstream repos are MIT licensed; their licence files travel with them.
