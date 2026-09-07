/**
 * Brand palette as linear-space hex for the 3D scenes.
 *
 * These mirror the CSS tokens in src/index.css so the WebGL stage and the DOM
 * mirror read as one design. Blue is the light source throughout; gold is rare.
 */
export const PALETTE = {
  navy: '#0d2c3e',
  canvas: '#070d14',
  blue: '#3970b6',
  blueBright: '#5b96e0',
  gold: '#cdcd00',
  offWhite: '#f0f0f0',
  slate: '#303142',
} as const;

/**
 * Fog does the depth work: stations sit ~30 units apart, so anything past the
 * next one should be gone rather than competing with the copy you are reading.
 */
export const FOG = { color: PALETTE.canvas, near: 14, far: 62 } as const;
