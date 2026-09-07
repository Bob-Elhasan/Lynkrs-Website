# Lynkrs Website

Marketing site for Lynkrs. React 19 + Vite + Tailwind CSS 4, with two upstream
component libraries vendored in as source.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with autofix |
| `npm run format` | Prettier over `src/` |

## Stack

- **React 19** with the native document-metadata support, so there is no helmet
  library. Page `<title>` and `<meta>` come from `src/components/seo.tsx`.
- **Vite 8** with `@vitejs/plugin-react` and `@tailwindcss/vite`.
- **Tailwind CSS 4**, configured entirely in CSS. There is no `tailwind.config.js`.
- **TypeScript** in strict mode, with `@/*` aliased to `src/*`.
- **React Router 7** for client-side routing.
- **Motion 12** for animation.

## Layout

```
src/
  components/
    layout/              header, footer, logo, page shell
    motion-primitives/   33 animated components (from ibelick/motion-primitives)
    sections/            the composed page sections
    ui/                  58 shadcn-style primitives (from WatermelonCorp)
  hooks/
  lib/
    site.ts              all site copy and navigation, in one place
    utils.ts             the `cn` class merger
  pages/                 one file per route
  styles/vendor/         shadcn utility layer that ui/ depends on
  index.css              design tokens and Tailwind entry
vendor/
  motion-primitives/     full upstream repo, for reference
  watermelon-platform/   full upstream repo, for reference
```

## Editing the site

**Copy and navigation** live in `src/lib/site.ts`. Headline, subhead, features,
steps, stats, FAQ, footer columns and social links are all there, so rewriting
the positioning is one file, not a hunt through JSX.

> The copy currently in that file is placeholder positioning. Replace it with
> the real Lynkrs messaging before launch.

**Routes** are declared in `src/App.tsx` and each one is a file in `src/pages/`.

## Rebranding

Every colour resolves back to the token block at the top of `src/index.css`.
The accent is a single variable:

```css
:root {
  --brand: oklch(0.85 0.198 124); /* swap this to rebrand */
  --brand-foreground: oklch(0.16 0.01 260);
}
```

Values are `oklch(lightness chroma hue)`, so you can move the hue without
rebalancing contrast. Light and dark ramps are defined separately under `:root`
and `.dark`; the site defaults to dark and the header toggle switches it.

## The vendored repositories

`vendor/` holds both upstream repos at full source, with their git history
removed so they do not nest inside this one:

| Directory | Upstream | Pinned at |
| --- | --- | --- |
| `vendor/motion-primitives` | [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | `92586e6` |
| `vendor/watermelon-platform` | [WatermelonCorp/watermelon-platform](https://github.com/WatermelonCorp/watermelon-platform) | `1531072` |

They are reference material, not build inputs. Nothing in `src/` imports from
them, ESLint ignores them, and `src/index.css` carries an `@source not '../vendor'`
so Tailwind does not scan them. That last line matters: without it Tailwind
generates utilities for every class in two entire component libraries and the
CSS bundle goes from 28kB gzipped to 124kB.

Both upstream repos are MIT licensed. Their licence files travel with them.

### Pulling more from the catalogs

`vendor/watermelon-platform/src` has a large library of blocks, dashboards and
MDX content beyond the 58 primitives already copied into `src/components/ui/`.
To adopt something, copy the file into `src/` and install any package it
imports. The primitives assume `@/lib/utils`, `@/lib/hugeicons` and the Radix
`radix-ui` package, all of which are already here.

All 58 primitives are already in `src/components/ui/`, and the packages the
heavier ones need (`cmdk`, `vaul`, `recharts`, `input-otp`, `react-day-picker`,
`embla-carousel-react`, `react-resizable-panels`, `@base-ui/react`) are
installed and pinned to the ranges those components were written against, so
they work without extra setup. Note that `react-day-picker` in particular is
held at `^9.14.0`: v10 renamed the class keys `calendar.tsx` uses.

## Changes made to the ported components

The two libraries were written for older toolchains, so bringing them into a
React 19 / Motion 12 / strict-TypeScript app needed fixes. These are worth
knowing about if you ever diff against upstream:

- Type-only imports throughout, for `verbatimModuleSyntax`.
- `JSX.IntrinsicElements` → `React.JSX.IntrinsicElements`; React 19 removed the
  global `JSX` namespace.
- `motion.create()` results are cast, since it now returns `unknown` props.
- Transition objects are annotated so `type: 'spring'` and `ease: 'linear'` keep
  their literal types under Motion 12's narrower `Transition`.
- `useScroll`'s `layoutEffect` option was removed in Motion 12.
- `useClickOutside` accepts `RefObject<T | null>`, which is what React 19's
  `useRef<T>(null)` actually returns.
- `InView` gained `className`/`style`, and its `once` flag is now passed to
  `useInView` instead of latching on animation completion. The old behaviour
  meant a fast scroll past a delayed element never finished animating, so the
  element re-hid itself.
- `DisclosureTrigger` spread the child's props *after* its own, which discarded
  the merged `className` and the click handler. The order is now child first.

ESLint holds `src/components/ui`, `src/components/motion-primitives` and
`src/hooks` to a softer bar than code we write, because they predate the React
Compiler lint rules and rewriting them would fork us from upstream for no
behavioural gain. Those show up as warnings, not errors. See `eslint.config.js`.

## Deploying

The build is a static SPA in `dist/`. Any static host works.

- **Cloudflare Pages / Netlify**: build `npm run build`, output `dist`. The
  `public/_redirects` file already handles the SPA fallback.
- **Vercel**: framework preset Vite; add a rewrite of `/(.*)` to `/index.html`.
- **Anything else**: serve `dist/` and rewrite unknown paths to `index.html`,
  otherwise a hard refresh on `/work` 404s.

### Environment

Copy `.env.example` to `.env` and fill in what you need. All are optional.

| Variable | Effect |
| --- | --- |
| `VITE_SITE_URL` | Canonical URL for `<link rel="canonical">` and OG tags |
| `VITE_CONTACT_ENDPOINT` | Where the contact form POSTs. Unset, the form falls back to a `mailto:` handoff |
| `VITE_ANALYTICS_ID` | Reserved; nothing reads it yet |

## Before launch

- [ ] Replace the placeholder copy in `src/lib/site.ts`
- [ ] Replace the placeholder case studies in `src/pages/work.tsx`
- [ ] Swap the wordmarks in the logo strip for real logo images
- [ ] Set `--brand` to the real Lynkrs colour and replace `public/favicon.svg`
- [ ] Add `/privacy` and `/terms` pages — the footer links to them and they
      currently fall through to the 404 page
- [ ] Point `VITE_CONTACT_ENDPOINT` at a real form handler
- [ ] Add an OG image and pass it to `<Seo image="..." />`
- [ ] Generate a `sitemap.xml` (`public/robots.txt` already references one)
