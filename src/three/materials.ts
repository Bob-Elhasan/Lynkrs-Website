import * as THREE from 'three';
import { createBrushedNoiseTexture } from './textures';

export const PALETTE = {
  bg: 0x0a0a0a,
  steel: 0x8a8a8a,
  darkSteel: 0x3f3f3f,
  gold: 0xc8a85c,
  warmWhite: 0xfff5e0,
} as const;

export type SceneMaterials = ReturnType<typeof buildMaterials>;

/** Builds every material the scene reuses, sharing the env map + noise maps. */
export function buildMaterials(envMap: THREE.Texture) {
  const brushed = createBrushedNoiseTexture(256, 0.6);
  const brushedFine = createBrushedNoiseTexture(512, 0.35);

  const steel = new THREE.MeshStandardMaterial({
    color: PALETTE.steel,
    metalness: 0.9,
    roughness: 0.32,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 1.1,
  });

  const darkSteel = new THREE.MeshStandardMaterial({
    color: PALETTE.darkSteel,
    metalness: 0.85,
    roughness: 0.35,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 0.9,
  });

  const gold = new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    metalness: 0.75,
    roughness: 0.28,
    roughnessMap: brushedFine,
    envMap,
    envMapIntensity: 1.2,
    emissive: new THREE.Color(PALETTE.gold),
    emissiveIntensity: 0.06,
  });

  const wallDark = new THREE.MeshStandardMaterial({
    color: 0x17181a,
    metalness: 0.15,
    roughness: 0.85,
    envMap,
    envMapIntensity: 0.25,
  });

  const wallInterior = new THREE.MeshStandardMaterial({
    color: 0x1d1e20,
    metalness: 0.4,
    roughness: 0.55,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 0.5,
  });

  const floorPolished = new THREE.MeshStandardMaterial({
    color: 0x121214,
    metalness: 0.45,
    roughness: 0.18,
    envMap,
    envMapIntensity: 0.8,
  });

  const marbleFloor = new THREE.MeshStandardMaterial({
    color: 0x1a1a1d,
    metalness: 0.1,
    roughness: 0.25,
    envMap,
    envMapIntensity: 0.6,
  });

  const buttonOff = new THREE.MeshStandardMaterial({
    color: 0x2f2f31,
    metalness: 0.7,
    roughness: 0.35,
    envMap,
    envMapIntensity: 0.6,
  });

  const buttonLit = new THREE.MeshStandardMaterial({
    color: PALETTE.gold,
    metalness: 0.5,
    roughness: 0.3,
    emissive: new THREE.Color(PALETTE.gold),
    emissiveIntensity: 0.9,
    envMap,
    envMapIntensity: 0.6,
  });

  const emissivePanel = new THREE.MeshBasicMaterial({ color: PALETTE.warmWhite });

  const doorPanel = new THREE.MeshStandardMaterial({
    color: 0x2a2b2d,
    metalness: 0.55,
    roughness: 0.4,
    roughnessMap: brushed,
    envMap,
    envMapIntensity: 0.7,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a,
    metalness: 0,
    roughness: 0.05,
    transmission: 0.85,
    thickness: 0.02,
    envMap,
    envMapIntensity: 1,
  });

  return {
    steel,
    darkSteel,
    gold,
    wallDark,
    wallInterior,
    floorPolished,
    marbleFloor,
    buttonOff,
    buttonLit,
    emissivePanel,
    doorPanel,
    glass,
  };
}

export function disposeMaterials(materials: SceneMaterials) {
  Object.values(materials).forEach((mat) => {
    const std = mat as THREE.MeshStandardMaterial;
    std.roughnessMap?.dispose();
    std.map?.dispose();
    mat.dispose();
  });
}
