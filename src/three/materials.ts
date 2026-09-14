import * as THREE from 'three';
import { tiled, type SceneAssets } from './assets';
import type { Theme } from './theme';

export type SceneMaterials = ReturnType<typeof buildMaterials>;

/**
 * Surfaces are built from the vendored CC0 PBR sets. Each material keeps a
 * `themeKey` so a mode change only has to re-tint albedo, rather than rebuild
 * anything: one set of textures serves both light and dark.
 */
type Themed = THREE.MeshStandardMaterial & { themeKey?: keyof Theme['surface'] };

function themed(mat: THREE.MeshStandardMaterial, key: keyof Theme['surface']): Themed {
  const m = mat as Themed;
  m.themeKey = key;
  return m;
}

export function buildMaterials(assets: SceneAssets, envMap: THREE.Texture, theme: Theme) {
  const s = theme.surface;

  /** Brushed steel: the car's signature surface. */
  const steel = themed(
    new THREE.MeshStandardMaterial({
      color: s.steel,
      map: tiled(assets.steel.color, 8, 8),
      normalMap: tiled(assets.steel.normal, 8, 8),
      roughnessMap: tiled(assets.steel.rough, 8, 8),
      metalnessMap: tiled(assets.steel.metal, 8, 8),
      metalness: 0.82,
      roughness: 0.58,
      envMap,
      envMapIntensity: 0.72,
    }),
    'steel',
  );
  steel.normalScale.set(0.35, 0.35);

  const steelDark = themed(
    new THREE.MeshStandardMaterial({
      color: s.trim,
      map: tiled(assets.steel.color, 10, 10),
      normalMap: tiled(assets.steel.normal, 10, 10),
      roughnessMap: tiled(assets.steel.rough, 10, 10),
      metalness: 0.85,
      roughness: 0.62,
      envMap,
      envMapIntensity: 0.6,
    }),
    'trim',
  );
  steelDark.normalScale.set(0.3, 0.3);

  /** Oak, for the corridor doors and cab trim. */
  const wood = themed(
    new THREE.MeshStandardMaterial({
      color: s.wood,
      map: tiled(assets.wood.color, 1, 1),
      normalMap: tiled(assets.wood.normal, 1, 1),
      roughnessMap: tiled(assets.wood.rough, 1, 1),
      aoMap: tiled(assets.wood.ao, 1, 1),
      metalness: 0,
      roughness: 0.62,
      envMap,
      envMapIntensity: 0.22,
    }),
    'wood',
  );
  wood.normalScale.set(0.6, 0.6);

  const woodDark = themed(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(s.wood).multiplyScalar(0.72).getHex(),
      map: tiled(assets.wood.color, 1, 1),
      normalMap: tiled(assets.wood.normal, 1, 1),
      roughnessMap: tiled(assets.wood.rough, 1, 1),
      metalness: 0,
      roughness: 0.68,
      envMap,
      envMapIntensity: 0.18,
    }),
    'wood',
  );

  /** Polished concrete underfoot — the main reflective plane. */
  const floorStone = themed(
    new THREE.MeshStandardMaterial({
      color: s.floor,
      map: tiled(assets.concrete.color, 5, 5),
      normalMap: tiled(assets.concrete.normal, 5, 5),
      roughnessMap: tiled(assets.concrete.rough, 5, 5),
      metalness: 0.05,
      roughness: 0.34,
      envMap,
      envMapIntensity: 0.5,
    }),
    'floor',
  );
  floorStone.normalScale.set(0.25, 0.25);

  /** Painted plaster: fine tooth, so raking light has something to catch. */
  const wallCream = themed(
    new THREE.MeshStandardMaterial({
      color: s.wall,
      map: tiled(assets.plaster.color, 4, 2),
      normalMap: tiled(assets.plaster.normal, 4, 2),
      roughnessMap: tiled(assets.plaster.rough, 4, 2),
      metalness: 0,
      roughness: 0.95,
      envMap,
      envMapIntensity: 0.08,
    }),
    'wall',
  );
  wallCream.normalScale.set(0.4, 0.4);

  const ceiling = themed(
    new THREE.MeshStandardMaterial({
      color: s.ceiling,
      map: tiled(assets.plaster.color, 4, 4),
      normalMap: tiled(assets.plaster.normal, 4, 4),
      metalness: 0,
      roughness: 0.98,
      emissive: new THREE.Color(s.ceiling),
      emissiveIntensity: 0.16,
      envMap,
      envMapIntensity: 0.06,
    }),
    'ceiling',
  );
  ceiling.normalScale.set(0.25, 0.25);

  /**
   * The projection screen. Deliberately dark in both modes: an additive throw
   * needs something to be bright against, and a light wall just greys it out.
   */
  const screen = new THREE.MeshStandardMaterial({
    color: 0x1a1e25,
    map: tiled(assets.plaster.color, 1, 1),
    metalness: 0,
    roughness: 1,
    envMap,
    envMapIntensity: 0.02,
  });

  const wallNavy = themed(
    new THREE.MeshStandardMaterial({
      color: 0x1b2a3d,
      map: tiled(assets.plaster.color, 2, 2),
      normalMap: tiled(assets.plaster.normal, 2, 2),
      metalness: 0.04,
      roughness: 0.82,
      envMap,
      envMapIntensity: 0.12,
    }),
    'trim',
  );
  wallNavy.themeKey = undefined; // navy is a constant, not a themed surface

  /** Woven runner. */
  const rug = themed(
    new THREE.MeshStandardMaterial({
      color: s.carpet,
      map: tiled(assets.carpet.color, 1, 6),
      normalMap: tiled(assets.carpet.normal, 1, 6),
      roughnessMap: tiled(assets.carpet.rough, 1, 6),
      aoMap: tiled(assets.carpet.ao, 1, 6),
      metalness: 0,
      roughness: 1,
    }),
    'carpet',
  );
  rug.normalScale.set(0.8, 0.8);

  const brass = themed(
    new THREE.MeshStandardMaterial({
      color: 0x9aa2ac,
      map: tiled(assets.steel.color, 1, 1),
      roughnessMap: tiled(assets.steel.rough, 1, 1),
      metalness: 1,
      roughness: 0.28,
      envMap,
      envMapIntensity: 1,
    }),
    'steel',
  );

  const accentBlue = new THREE.MeshStandardMaterial({
    color: 0x3c76c0,
    metalness: 0.1,
    roughness: 0.5,
    envMap,
    envMapIntensity: 0.3,
  });

  const accentYellow = new THREE.MeshStandardMaterial({
    color: 0xcdcd00,
    metalness: 0.1,
    roughness: 0.45,
    envMap,
    envMapIntensity: 0.25,
  });

  const buttonOff = new THREE.MeshStandardMaterial({
    color: 0x2c3542,
    map: tiled(assets.steel.color, 1, 1),
    metalness: 0.55,
    roughness: 0.62,
    envMap,
    envMapIntensity: 0.35,
  });

  const buttonLit = new THREE.MeshStandardMaterial({
    color: 0x9dc2f0,
    emissive: new THREE.Color(0x3c76c0),
    emissiveIntensity: 1.1,
    metalness: 0.2,
    roughness: 0.3,
    envMap,
    envMapIntensity: 0.3,
  });

  const lightPanel = new THREE.MeshStandardMaterial({
    color: 0xf2f4f7,
    emissive: new THREE.Color(theme.light.colour),
    emissiveIntensity: theme.light.panelEmissive,
    roughness: 1,
    metalness: 0,
  });

  const foliage = new THREE.MeshStandardMaterial({
    color: 0x46644d,
    roughness: 0.52,
    metalness: 0,
    side: THREE.DoubleSide,
    flatShading: false,
    envMap,
    envMapIntensity: 0.45,
  });

  const foliageDeep = new THREE.MeshStandardMaterial({
    color: 0x32503b,
    roughness: 0.6,
    metalness: 0,
    side: THREE.DoubleSide,
    envMap,
    envMapIntensity: 0.35,
  });

  const pot = themed(
    new THREE.MeshStandardMaterial({
      color: s.wall,
      map: tiled(assets.plaster.color, 1, 1),
      normalMap: tiled(assets.plaster.normal, 1, 1),
      roughness: 0.7,
      metalness: 0.04,
      envMap,
      envMapIntensity: 0.2,
    }),
    'wall',
  );

  const soil = new THREE.MeshStandardMaterial({ color: 0x2e2822, roughness: 1, metalness: 0 });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.08,
    transmission: 0.9,
    thickness: 0.03,
    envMap,
    envMapIntensity: 0.8,
  });

  /** The projected image inside each room. Unlit by design — it is light. */
  const projection = new THREE.MeshBasicMaterial({
    transparent: true,
    toneMapped: false,
    side: THREE.FrontSide,
  });

  return {
    steel,
    steelDark,
    wood,
    woodDark,
    floorStone,
    wallCream,
    ceiling,
    screen,
    wallNavy,
    rug,
    brass,
    accentBlue,
    accentYellow,
    buttonOff,
    buttonLit,
    lightPanel,
    foliage,
    foliageDeep,
    pot,
    soil,
    glass,
    projection,
  };
}

/** Re-tints themed surfaces in place. Textures and geometry are untouched. */
export function applyThemeToMaterials(
  materials: SceneMaterials,
  surface: Theme['surface'],
  lightColour: number,
  panelEmissive: number,
) {
  Object.values(materials).forEach((mat) => {
    const m = mat as THREE.MeshStandardMaterial & { themeKey?: keyof Theme['surface'] };
    if (!m.themeKey) return;
    const target = surface[m.themeKey];
    if (typeof target === 'number') m.color.setHex(target);
  });
  materials.woodDark.color.setHex(new THREE.Color(surface.wood).multiplyScalar(0.72).getHex());
  materials.ceiling.emissive.setHex(surface.ceiling);
  materials.lightPanel.emissive.setHex(lightColour);
  materials.lightPanel.emissiveIntensity = panelEmissive;
}

export function disposeMaterials(materials: SceneMaterials) {
  Object.values(materials).forEach((mat) => {
    const m = mat as THREE.MeshStandardMaterial;
    m.map?.dispose();
    m.normalMap?.dispose();
    m.roughnessMap?.dispose();
    m.metalnessMap?.dispose();
    m.aoMap?.dispose();
    mat.dispose();
  });
}
