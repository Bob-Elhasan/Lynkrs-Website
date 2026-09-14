import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { PALETTE, CSS } from './palette';
import { createEngravedPlaque } from './textures';

/**
 * The set dressing. None of it is interactive except the telephone, but it
 * is what stops the scene reading as grey boxes: greenery by the lift, a
 * runner down the corridor, real fixtures overhead.
 */

/** A potted plant: tapered pot, soil, and a fan of curved leaves. */
export function createPlant(materials: SceneMaterials, scale = 1) {
  const group = new THREE.Group();

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.4, 24), materials.pot);
  pot.position.y = 0.2;
  pot.castShadow = true;
  group.add(pot);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.018, 10, 28), materials.brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.4;
  group.add(rim);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.03, 20), materials.soil);
  soil.position.y = 0.4;
  group.add(soil);

  // Leaves: a lathe-shaped blade, splayed and tilted outward around the pot.
  const bladeProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    bladeProfile.push(new THREE.Vector2(Math.sin(t * Math.PI) * 0.055 + 0.004, t * 0.72));
  }
  const bladeGeo = new THREE.LatheGeometry(bladeProfile, 5);

  const count = 11;
  for (let i = 0; i < count; i++) {
    const leaf = new THREE.Mesh(bladeGeo, i % 3 === 0 ? materials.foliageDeep : materials.foliage);
    const angle = (i / count) * Math.PI * 2;
    const lean = 0.32 + (i % 4) * 0.13;
    leaf.position.set(Math.cos(angle) * 0.05, 0.42, Math.sin(angle) * 0.05);
    leaf.rotation.set(Math.cos(angle) * lean, angle, Math.sin(angle) * -lean);
    leaf.scale.setScalar(0.85 + (i % 3) * 0.22);
    leaf.castShadow = true;
    group.add(leaf);
  }

  group.scale.setScalar(scale);
  return group;
}

/** Recessed ceiling fixture: emissive panel in a slim steel housing. */
export function createCeilingFixture(materials: SceneMaterials, width = 1.1, depth = 0.22) {
  const group = new THREE.Group();

  const housing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.06, 0.05, depth + 0.06), materials.steelDark);
  housing.position.y = 0.02;
  group.add(housing);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 0.02, depth), materials.lightPanel);
  panel.position.y = -0.012;
  group.add(panel);

  return group;
}

/** Runner rug, laid just above the floor to avoid z-fighting. */
export function createRunner(materials: SceneMaterials, width: number, length: number) {
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(width, length), materials.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.006;
  rug.receiveShadow = true;
  return rug;
}

export type TelephoneBuild = {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  handset: THREE.Mesh;
};

/**
 * The elevator telephone, relabelled "Get In Touch" — a recessed cabinet
 * with a handset on a coiled cord. Picking it up opens the contact form.
 */
export function createTelephone(materials: SceneMaterials): TelephoneBuild {
  const group = new THREE.Group();

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.1), materials.steelDark);
  cabinet.position.z = -0.05;
  group.add(cabinet);

  const surround = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.02), materials.brass);
  surround.position.z = -0.095;
  group.add(surround);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.38), materials.wallNavy);
  back.position.z = 0.001;
  group.add(back);

  // Handset: body plus two earpiece caps.
  const handset = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.16, 6, 14), materials.steel);
  handset.rotation.z = Math.PI / 2;
  handset.position.set(0, 0.05, 0.045);
  handset.castShadow = true;
  group.add(handset);

  [-0.088, 0.088].forEach((x) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.035, 16), materials.steelDark);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(x, 0.05, 0.052);
    group.add(cap);
  });

  // Coiled cord.
  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      return new THREE.Vector3(Math.sin(t * Math.PI * 7) * 0.028, 0.03 - t * 0.17, 0.03 + Math.cos(t * Math.PI * 7) * 0.012);
    }),
  );
  const cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.008, 6, false), materials.steelDark);
  group.add(cord);

  const plaqueTex = createEngravedPlaque('GET IN TOUCH', 512, 96, {
    fontSize: 44,
    letterSpacing: 5,
    accent: 'rgba(24,50,83,0.85)',
  });
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.29, 0.055),
    new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.35, metalness: 0.7 }),
  );
  plaque.position.set(0, -0.155, 0.004);
  group.add(plaque);

  // Generous invisible target so it is easy to tap on a phone.
  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.54),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.z = 0.08;
  hitMesh.userData = { kind: 'telephone' };
  group.add(hitMesh);

  return { group, hitMesh, handset };
}

/** Wall sign: navy plate, blue rule, engraved text. Used for floor signage. */
export function createWallSign(text: string, width = 1.4, height = 0.3) {
  const tex = createEngravedPlaque(text, 640, 140, { fontSize: 52, letterSpacing: 7 });
  const group = new THREE.Group();

  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.34, metalness: 0.72 }),
  );
  group.add(plate);

  const rule = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 0.012),
    new THREE.MeshStandardMaterial({ color: PALETTE.yellow, roughness: 0.5 }),
  );
  rule.position.y = -height / 2 - 0.016;
  group.add(rule);

  return group;
}

/** Simple bench for corridor ends, to give the space a lived-in scale. */
export function createBench(materials: SceneMaterials) {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.42), materials.wood);
  seat.position.y = 0.45;
  seat.castShadow = true;
  group.add(seat);
  [-0.55, 0.55].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.36), materials.steelDark);
    leg.position.set(x, 0.225, 0);
    group.add(leg);
  });
  return group;
}

export const PROP_COLORS = { accent: CSS.blue, highlight: CSS.yellow };
