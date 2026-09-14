import * as THREE from 'three';

/**
 * Loads the vendored CC0 PBR sets (ambientCG, CC0) and the brand marks.
 *
 * These replace the canvas-drawn approximations that made surfaces read as
 * flat colour: real colour, normal, roughness, metalness and AO maps are what
 * give the steel its grain and the walls their tooth under a moving light.
 */

export type PbrSet = {
  color?: THREE.Texture;
  normal?: THREE.Texture;
  rough?: THREE.Texture;
  metal?: THREE.Texture;
  ao?: THREE.Texture;
};

export type SceneAssets = {
  steel: PbrSet;
  wood: PbrSet;
  concrete: PbrSet;
  plaster: PbrSet;
  carpet: PbrSet;
  logoWhite: THREE.Texture;
  logoMark: THREE.Texture;
  dispose: () => void;
};

const SETS: Record<string, string[]> = {
  steel: ['color', 'normal', 'rough', 'metal'],
  wood: ['color', 'normal', 'rough', 'ao'],
  concrete: ['color', 'normal', 'rough'],
  plaster: ['color', 'normal', 'rough'],
  carpet: ['color', 'normal', 'rough', 'ao'],
};

/** Colour maps are sRGB; every other channel carries data, not colour. */
const COLOUR_MAPS = new Set(['color']);

function base() {
  return `${import.meta.env.BASE_URL}textures/`;
}

export async function loadAssets(
  renderer: THREE.WebGLRenderer,
  onProgress?: (fraction: number) => void,
): Promise<SceneAssets> {
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const loaded: THREE.Texture[] = [];

  const jobs: { set: string; map: string; url: string }[] = [];
  for (const [set, maps] of Object.entries(SETS)) {
    for (const map of maps) jobs.push({ set, map, url: `${base()}${set}_${map}.webp` });
  }
  const extras = [
    { set: 'logo', map: 'white', url: `${base()}logo_white.webp` },
    { set: 'logo', map: 'mark', url: `${base()}logo_mark.webp` },
  ];
  const all = [...jobs, ...extras];

  let done = 0;
  const results = await Promise.all(
    all.map(
      (job) =>
        new Promise<{ job: typeof job; texture: THREE.Texture | null }>((resolve) => {
          loader.load(
            job.url,
            (texture) => {
              texture.anisotropy = anisotropy;
              texture.generateMipmaps = true;
              texture.minFilter = THREE.LinearMipmapLinearFilter;
              texture.magFilter = THREE.LinearFilter;
              if (COLOUR_MAPS.has(job.map) || job.set === 'logo') {
                texture.colorSpace = THREE.SRGBColorSpace;
              }
              if (job.set !== 'logo') {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
              }
              loaded.push(texture);
              done += 1;
              onProgress?.(done / all.length);
              resolve({ job, texture });
            },
            undefined,
            () => {
              // A missing map degrades the material rather than breaking the
              // scene, so one failed request never blanks the page.
              done += 1;
              onProgress?.(done / all.length);
              resolve({ job, texture: null });
            },
          );
        }),
    ),
  );

  const sets: Record<string, PbrSet> = { steel: {}, wood: {}, concrete: {}, plaster: {}, carpet: {} };
  let logoWhite: THREE.Texture | null = null;
  let logoMark: THREE.Texture | null = null;

  for (const { job, texture } of results) {
    if (!texture) continue;
    if (job.set === 'logo') {
      if (job.map === 'white') logoWhite = texture;
      else logoMark = texture;
    } else {
      (sets[job.set] as Record<string, THREE.Texture>)[job.map] = texture;
    }
  }

  const blank = new THREE.Texture();
  return {
    steel: sets.steel,
    wood: sets.wood,
    concrete: sets.concrete,
    plaster: sets.plaster,
    carpet: sets.carpet,
    logoWhite: logoWhite ?? blank,
    logoMark: logoMark ?? blank,
    dispose: () => {
      loaded.forEach((t) => t.dispose());
      blank.dispose();
    },
  };
}

/**
 * Tiling has to be set per surface, but textures are shared, so each surface
 * gets its own cheap clone rather than fighting over one repeat value.
 */
export function tiled(texture: THREE.Texture | undefined, x: number, y: number) {
  if (!texture) return undefined;
  const clone = texture.clone();
  clone.wrapS = THREE.RepeatWrapping;
  clone.wrapT = THREE.RepeatWrapping;
  clone.repeat.set(x, y);
  clone.needsUpdate = true;
  return clone;
}
