# Lynkrs — The Elevator Pitch brand spec

**Artifact:** first-person spatial marketing landing page prototype. The experience uses a dark steel elevator, cool blue light, and a single acid-lime interaction signal to make the brand feel like a tactile creative system rather than a standard landing page.

| Token | Value |
|---|---|
| Primary ink | `#080B10` |
| Steel / neutral | `#151D25` → `#59646C` |
| Lynkrs blue | `#72AAF4` |
| Signal lime | `#D8F24D` |
| Display type | Archivo Variable |
| UI type | Inter Variable |
| Motion | Cubic-bezier camera pushes; short tactile button feedback |
| Spacing | 8px base rhythm |

## Assets

- `/public/lynkrs-logo.png` — existing Lynkrs logo supplied in the repository. Used as the engraved door plaque and topbar lockup; CSS applies monochrome treatment where required for the steel scene.

## Interaction assumptions

- Wheel / trackpad scroll advances through five spatial states: closed door, entering the lift, facing the console, opening into the corridor, and selecting a corridor door.
- Console buttons are always clickable and jump to the selected destination. The Services route reveals four corridor doors: Content, Media Buying, SEO, and Consultancy.
- The prototype is intentionally CSS-based for a lightweight, mobile-safe first validation before adding true WebGL geometry or externally hosted 3D assets.
