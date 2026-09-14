/**
 * The scene reads from the same brand values as the DOM side of the site:
 * cream ground, navy ink, blue as the light source, yellow kept rare.
 * Kept as hex numbers because that is what Three.js wants.
 */
export const PALETTE = {
  cream: 0xf7f8fb,
  creamWarm: 0xeef0f3,
  ink: 0x183253,
  inkDeep: 0x10233a,
  blue: 0x3c76c0,
  blueLight: 0x6d9ddb,
  yellow: 0xcdcd00,
  white: 0xffffff,

  steel: 0xc3c9d0,
  steelDark: 0x8d959e,
  wood: 0xb1793f,
  woodDark: 0x7d5327,
  floorStone: 0xdfe3e8,
  rugNavy: 0x1d3a5f,

  lightWarm: 0xfff4e2,
  foliage: 0x4a7a52,
  foliageDeep: 0x35603c,
} as const;

/** CSS equivalents, for the canvas-drawn textures. */
export const CSS = {
  cream: '#f7f8fb',
  ink: '#183253',
  inkSoft: '#4a6180',
  blue: '#3c76c0',
  yellow: '#cdcd00',
  white: '#ffffff',
  steel: '#c3c9d0',
  engrave: '#7b8794',
} as const;
