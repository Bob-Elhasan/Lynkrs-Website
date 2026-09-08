# Lynkrs

The Lynkrs agency site: a React + Tailwind marketing site, shipped as a PWA on
GitHub Pages.

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

An ordinary, server-rendered-at-build-time marketing site: a home page built
from named sections (hero, problem, positioning, principles, method, growth
suite, modules, together, contact), plus dedicated pages for services,
bundles, portfolio, case studies and the contact form. Every route is real
semantic HTML — no canvas, no client-side-only content — prerendered at build
time so crawlers, screen readers and slow connections all get the full page
before any JavaScript runs.

Scroll-reveal and hover polish is layered on top with a small set of Motion
(Framer Motion successor)-based components in
`src/components/motion-primitives/`, wrapped by the house-style helpers in
`src/components/marketing/` (`Reveal`, `RevealGroup`) so the same restrained
fade-and-slide is used everywhere rather than one-off animation per section.
`prefers-reduced-motion` is honoured globally via `<MotionConfig
reducedMotion="user">` in `src/App.tsx`.

## Architecture

```
src/
  content/          all copy, one file per domain — the single source of truth
  components/
    sections/       homepage section components (hero, problem, method, …)
    marketing/       shared presentational building blocks: cards, Reveal,
                     RevealGroup, typography, icon maps
    layout/          header, footer, root layout
    ui/              57 shadcn-style primitives (Watermelon)
    motion-primitives/  vendored animated components (ibelick)
  pages/             one file per route
  prerender-entry.tsx  build-time static rendering
scripts/prerender.mjs  writes the prerendered HTML into every route's index.html
vendor/              both upstream component repos, kept as reference source
```

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
