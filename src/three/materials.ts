import * as THREE from 'three';
import { PALETTE } from './palette';
import {
  createBrushedMetalMap,
  createRugTexture,
  createStoneFloorTexture,
  createWallTexture,
  createWoodTexture,
} from './textures';

export type SceneMaterials = ReturnType<typeof buildMaterials>;

/** Every material the scene reuses, sharing one env map and one texture set. */
export function buildMaterials(envMap: THREE.Texture) {
  const brushed = createBrushedMetalMap(512);
  const wood = createWoodTexture(1024);
  const stone = createStoneFloorTexture(1024);
  const wall = createWallTexture(512);
  const rug = createRugTexture();

  /** Polished brushed steel — the elevator's signature surface. */
  const steel = new THREE.MeshStandardMaterial({
    color: 0xa7b0ba,
    metalness: 0.95,
    roughness: 0.2,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 1.4,
  });

  const steelDark = new THREE.MeshStandardMaterial({
    color: PALETTE.steelDark,
    metalness: 0.88,
    roughness: 0.3,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 1.1,
  });

  /** Warm oak, used for corridor doors and cab trim. */
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xc9a883,
    map: wood,
    metalness: 0,
    roughness: 0.52,
    envMap,
    envMapIntensity: 0.35,
  });

  const woodDark = new THREE.MeshStandardMaterial({
    color: 0xd8c3a8,
    map: wood,
    metalness: 0,
    roughness: 0.6,
    envMap,
    envMapIntensity: 0.28,
  });

  /** Light stone floor with a gentle sheen, so lights read as reflections. */
  const floorStone = new THREE.MeshStandardMaterial({
    color: 0xa9b3bf,
    map: stone,
    metalness: 0.1,
    roughness: 0.26,
    envMap,
    envMapIntensity: 0.6,
  });

  const wallCream = new THREE.MeshStandardMaterial({
    color: 0xd8dde4,
    map: wall,
    metalness: 0,
    roughness: 0.92,
    envMap,
    envMapIntensity: 0.16,
  });

  const wallNavy = new THREE.MeshStandardMaterial({
    color: PALETTE.ink,
    metalness: 0.05,
    roughness: 0.75,
    envMap,
    envMapIntensity: 0.25,
  });

  const rugMat = new THREE.MeshStandardMaterial({
    color: 0xc6ced8,
    map: rug,
    metalness: 0,
    roughness: 0.95,
  });

  const brass = new THREE.MeshStandardMaterial({
    color: 0xb9bec6,
    metalness: 0.95,
    roughness: 0.18,
    envMap,
    envMapIntensity: 1.5,
  });

  const accentBlue = new THREE.MeshStandardMaterial({
    color: PALETTE.blue,
    metalness: 0.3,
    roughness: 0.45,
    envMap,
    envMapIntensity: 0.6,
  });

  const accentYellow = new THREE.MeshStandardMaterial({
    color: PALETTE.yellow,
    metalness: 0.25,
    roughness: 0.4,
    emissive: new THREE.Color(PALETTE.yellow),
    emissiveIntensity: 0.12,
    envMap,
    envMapIntensity: 0.5,
  });

  const buttonOff = new THREE.MeshStandardMaterial({
    color: 0xe8ebef,
    metalness: 0.6,
    roughness: 0.3,
    envMap,
    envMapIntensity: 0.8,
  });

  const buttonLit = new THREE.MeshStandardMaterial({
    color: PALETTE.blue,
    metalness: 0.3,
    roughness: 0.25,
    emissive: new THREE.Color(PALETTE.blue),
    emissiveIntensity: 1.4,
    envMap,
    envMapIntensity: 0.5,
  });

  /** Diffusing panel for the ceiling fixtures. */
  const lightPanel = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(PALETTE.lightWarm),
    emissiveIntensity: 1.15,
    roughness: 1,
    metalness: 0,
  });

  const foliage = new THREE.MeshStandardMaterial({
    color: PALETTE.foliage,
    roughness: 0.78,
    metalness: 0,
    side: THREE.DoubleSide,
    envMap,
    envMapIntensity: 0.3,
  });

  const foliageDeep = new THREE.MeshStandardMaterial({
    color: PALETTE.foliageDeep,
    roughness: 0.8,
    metalness: 0,
    side: THREE.DoubleSide,
    envMap,
    envMapIntensity: 0.25,
  });

  const pot = new THREE.MeshStandardMaterial({
    color: 0xe2e5e9,
    roughness: 0.55,
    metalness: 0.12,
    envMap,
    envMapIntensity: 0.5,
  });

  const soil = new THREE.MeshStandardMaterial({ color: 0x3c3227, roughness: 1, metalness: 0 });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.06,
    transmission: 0.92,
    thickness: 0.03,
    envMap,
    envMapIntensity: 1,
  });

  return {
    steel,
    steelDark,
    wood: woodMat,
    woodDark,
    floorStone,
    wallCream,
    wallNavy,
    rug: rugMat,
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
  };
}

export function disposeMaterials(materials: SceneMaterials) {
  Object.values(materials).forEach((mat) => {
    const std = mat as THREE.MeshStandardMaterial;
    std.map?.dispose();
    std.roughnessMap?.dispose();
    mat.dispose();
  });
}
