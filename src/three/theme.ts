import * as THREE from 'three';

export type ThemeName = 'light' | 'dark';

/**
 * Both modes are built from the same surfaces — only the values change.
 *
 * The rule that keeps everything readable in both: surface lightness and text
 * lightness move in opposite directions, and the accent hues stay put so the
 * brand still reads. Nothing is hidden in either mode, it just re-lights.
 */
export type Theme = {
  name: ThemeName;
  /** Multiplied into the albedo of each surface, so one texture serves both. */
  surface: {
    wall: number;
    floor: number;
    ceiling: number;
    steel: number;
    wood: number;
    carpet: number;
    trim: number;
  };
  light: {
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    ambient: number;
    keyIntensity: number;
    fixtureIntensity: number;
    /** Emissive strength of the diffuser panels themselves. */
    panelEmissive: number;
    colour: number;
  };
  fog: { colour: number; near: number; far: number };
  background: number;
  exposure: number;
  /** Canvas-drawn signage and boards flip ink/paper between modes. */
  ink: string;
  inkSoft: string;
  paper: string;
  accent: string;
  highlight: string;
};

const SHARED = {
  accent: '#3c76c0',
  highlight: '#cdcd00',
};

export const LIGHT_THEME: Theme = {
  name: 'light',
  surface: {
    // Deliberately off-white rather than white: pure white clips under ACES
    // and is what made the first pass look washed out.
    wall: 0xb9bec6,
    floor: 0x9aa2ac,
    ceiling: 0xc2c7ce,
    steel: 0x9fa7b1,
    wood: 0xd3ab7e,
    carpet: 0x8f99a6,
    trim: 0x6f7883,
  },
  light: {
    hemiSky: 0xffffff,
    hemiGround: 0x8a929c,
    hemiIntensity: 0.45,
    ambient: 0.1,
    keyIntensity: 1.15,
    fixtureIntensity: 1.5,
    panelEmissive: 0.9,
    colour: 0xfff4e6,
  },
  fog: { colour: 0xb6bcc4, near: 22, far: 70 },
  background: 0xb6bcc4,
  exposure: 0.92,
  ink: '#1b2a3d',
  inkSoft: '#51617a',
  paper: '#f2f4f7',
  ...SHARED,
};

export const DARK_THEME: Theme = {
  name: 'dark',
  surface: {
    wall: 0x2b3038,
    floor: 0x23272e,
    ceiling: 0x2f343c,
    steel: 0x555d68,
    wood: 0x8f7355,
    carpet: 0x2a3344,
    trim: 0x767f8b,
  },
  light: {
    hemiSky: 0x8fa4c4,
    hemiGround: 0x14181e,
    hemiIntensity: 0.34,
    ambient: 0.1,
    keyIntensity: 0.35,
    // Fixtures do most of the work after dark, so they carry more punch.
    fixtureIntensity: 2.6,
    panelEmissive: 2.2,
    colour: 0xffe9c8,
  },
  fog: { colour: 0x161a20, near: 16, far: 58 },
  background: 0x161a20,
  exposure: 1.0,
  ink: '#eef2f7',
  inkSoft: '#9fb0c4',
  paper: '#1d222a',
  ...SHARED,
};

export const THEMES: Record<ThemeName, Theme> = { light: LIGHT_THEME, dark: DARK_THEME };

/** Eases every themed value, so flipping the switch is a dissolve not a cut. */
export function lerpTheme(from: Theme, to: Theme, t: number) {
  const c = (a: number, b: number) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
  const n = (a: number, b: number) => a + (b - a) * t;
  return {
    surface: {
      wall: c(from.surface.wall, to.surface.wall),
      floor: c(from.surface.floor, to.surface.floor),
      ceiling: c(from.surface.ceiling, to.surface.ceiling),
      steel: c(from.surface.steel, to.surface.steel),
      wood: c(from.surface.wood, to.surface.wood),
      carpet: c(from.surface.carpet, to.surface.carpet),
      trim: c(from.surface.trim, to.surface.trim),
    },
    light: {
      hemiSky: c(from.light.hemiSky, to.light.hemiSky),
      hemiGround: c(from.light.hemiGround, to.light.hemiGround),
      hemiIntensity: n(from.light.hemiIntensity, to.light.hemiIntensity),
      ambient: n(from.light.ambient, to.light.ambient),
      keyIntensity: n(from.light.keyIntensity, to.light.keyIntensity),
      fixtureIntensity: n(from.light.fixtureIntensity, to.light.fixtureIntensity),
      panelEmissive: n(from.light.panelEmissive, to.light.panelEmissive),
      colour: c(from.light.colour, to.light.colour),
    },
    fog: {
      colour: c(from.fog.colour, to.fog.colour),
      near: n(from.fog.near, to.fog.near),
      far: n(from.fog.far, to.fog.far),
    },
    background: c(from.background, to.background),
    exposure: n(from.exposure, to.exposure),
  };
}
