import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { createEngravedAlpha, createLabelTexture } from './textures';
import type { Theme } from './theme';

/**
 * Set dressing. Plaques are now a real steel plate with the lettering cut
 * into it as a transparent overlay, rather than a painted-on picture of a
 * plate — that is most of what separated "sticker" from "engraving".
 */

export function createPlaque(
  materials: SceneMaterials,
  text: string,
  width: number,
  height: number,
  theme: Theme,
  fontSize = 44,
) {
  const group = new THREE.Group();

  const plate = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.012), materials.steelDark);
  group.add(plate);

  const engraving = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.98, height * 0.96),
    new THREE.MeshStandardMaterial({
      map: createEngravedAlpha(text, 1024, Math.round((1024 * height) / width), { fontSize, theme }),
      transparent: true,
      roughness: 0.5,
      metalness: 0.4,
      depthWrite: false,
    }),
  );
  engraving.position.z = 0.007;
  group.add(engraving);

  return group;
}

/**
 * A leaf: a tapered ribbon that arcs outward and droops at the tip. Built as
 * real geometry rather than a lathe blade, because the lathe silhouette is
 * what made the planting read as plastic.
 */
function leafGeometry(length: number, width: number, arc: number) {
  const steps = 10;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Wide at the shoulder, drawn to a point.
    const w = Math.sin(Math.pow(t, 0.7) * Math.PI) * width * 0.5 + 0.002;
    const y = t * length;
    const z = Math.sin(t * Math.PI * 0.85) * arc;
    positions.push(-w, y, z, w, y, z);
    normals.push(0, 0, 1, 0, 0, 1);
    uvs.push(0, t, 1, t);
    if (i < steps) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** A potted plant: tapered pot, soil, and a fan of arcing leaves. */
export function createPlant(materials: SceneMaterials, scale = 1) {
  const group = new THREE.Group();

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.15, 0.4, 28), materials.pot);
  pot.position.y = 0.2;
  pot.castShadow = true;
  pot.receiveShadow = true;
  group.add(pot);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.018, 12, 32), materials.brass);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.4;
  group.add(rim);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.03, 20), materials.soil);
  soil.position.y = 0.4;
  group.add(soil);

  // Three lengths of leaf, so the silhouette has depth rather than one ring.
  const shapes = [
    leafGeometry(0.86, 0.115, 0.1),
    leafGeometry(0.66, 0.1, 0.16),
    leafGeometry(0.46, 0.085, 0.2),
  ];

  const count = 17;
  for (let i = 0; i < count; i++) {
    const ring = i % 3;
    const leaf = new THREE.Mesh(shapes[ring], ring === 1 ? materials.foliageDeep : materials.foliage);
    // Golden-angle spacing keeps the fan from banding into rows.
    const angle = i * 2.39996;
    const lean = 0.14 + ring * 0.26 + (i % 5) * 0.035;
    leaf.position.set(Math.cos(angle) * 0.045, 0.4, Math.sin(angle) * 0.045);
    leaf.rotation.order = 'YXZ';
    leaf.rotation.y = angle;
    leaf.rotation.x = lean;
    leaf.scale.setScalar(0.86 + ((i * 7) % 5) * 0.07);
    leaf.castShadow = true;
    group.add(leaf);
  }

  group.scale.setScalar(scale);
  return group;
}

/** Recessed ceiling fixture: emissive diffuser in a slim housing. */
export function createCeilingFixture(materials: SceneMaterials, width = 1.1, depth = 0.22) {
  const group = new THREE.Group();

  const housing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.06, depth + 0.08), materials.steelDark);
  housing.position.y = 0.025;
  group.add(housing);

  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, 0.02, depth), materials.lightPanel);
  panel.position.y = -0.014;
  group.add(panel);

  return group;
}

export function createRunner(materials: SceneMaterials, width: number, length: number) {
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(width, length), materials.rug);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.008;
  rug.receiveShadow = true;
  return rug;
}

export type TelephoneBuild = {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
};

/**
 * The lift telephone, relabelled "Get In Touch". One of these sits in the car
 * and one beside the door of every room, so the offer is always within reach.
 */
export function createTelephone(materials: SceneMaterials, scale = 1): TelephoneBuild {
  const group = new THREE.Group();

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.1), materials.steelDark);
  cabinet.position.z = -0.05;
  cabinet.castShadow = true;
  group.add(cabinet);

  const surround = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.46, 0.02), materials.brass);
  surround.position.z = -0.095;
  group.add(surround);

  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.38), materials.wallNavy);
  back.position.z = 0.001;
  group.add(back);

  const handset = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.16, 8, 16), materials.steel);
  handset.rotation.z = Math.PI / 2;
  handset.position.set(0, 0.05, 0.045);
  handset.castShadow = true;
  group.add(handset);

  [-0.088, 0.088].forEach((x) => {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.035, 18), materials.steelDark);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(x, 0.05, 0.052);
    group.add(cap);
  });

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 24 }, (_, i) => {
      const t = i / 23;
      return new THREE.Vector3(
        Math.sin(t * Math.PI * 7) * 0.028,
        0.03 - t * 0.17,
        0.03 + Math.cos(t * Math.PI * 7) * 0.012,
      );
    }),
  );
  const cord = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.008, 8, false), materials.steelDark);
  group.add(cord);

  const labelPlate = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.062, 0.014), materials.wallNavy);
  labelPlate.position.set(0, -0.158, 0.004);
  group.add(labelPlate);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.04),
    new THREE.MeshBasicMaterial({
      map: createLabelTexture('GET IN TOUCH', 560, 86, {
        fontSize: 42,
        color: '#e8eef6',
        weight: '600',
        letterSpacing: 5,
      }),
      transparent: true,
      toneMapped: false,
    }),
  );
  label.position.set(0, -0.158, 0.012);
  group.add(label);

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.56),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.z = 0.09;
  hitMesh.userData = { kind: 'telephone' };
  group.add(hitMesh);

  group.scale.setScalar(scale);
  return { group, hitMesh };
}

export type LightSwitchBuild = {
  group: THREE.Group;
  hitMesh: THREE.Mesh;
  /** Rocker that tilts to show which way the switch is thrown. */
  rocker: THREE.Mesh;
  lamp: THREE.Mesh;
};

/**
 * Corridor light switch. Throwing it crossfades the whole building between
 * light and dark mode.
 */
export function createLightSwitch(materials: SceneMaterials, theme: Theme): LightSwitchBuild {
  const group = new THREE.Group();

  const backplate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.21, 0.018), materials.steelDark);
  group.add(backplate);

  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.23, 0.008), materials.brass);
  bezel.position.z = -0.008;
  group.add(bezel);

  const rocker = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.13, 0.022), materials.steel);
  rocker.position.z = 0.016;
  group.add(rocker);

  // Small pilot lamp, lit when the corridor is dark.
  const lamp = new THREE.Mesh(
    new THREE.CircleGeometry(0.011, 16),
    new THREE.MeshBasicMaterial({ color: 0xcdcd00, toneMapped: false }),
  );
  lamp.position.set(0, -0.078, 0.021);
  lamp.visible = theme.name === 'dark';
  group.add(lamp);

  const labelTex = createEngravedAlpha('LIGHTS', 256, 64, { fontSize: 30, letterSpacing: 4, theme });
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.037),
    new THREE.MeshStandardMaterial({
      map: labelTex,
      transparent: true,
      roughness: 0.55,
      metalness: 0.3,
      depthWrite: false,
    }),
  );
  label.position.set(0, 0.14, 0.002);
  group.add(label);

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.42),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.z = 0.05;
  hitMesh.userData = { kind: 'lightSwitch' };
  group.add(hitMesh);

  return { group, hitMesh, rocker, lamp };
}

export function createBench(materials: SceneMaterials) {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.42), materials.wood);
  seat.position.y = 0.45;
  seat.castShadow = true;
  group.add(seat);
  [-0.55, 0.55].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.36), materials.steelDark);
    leg.position.set(x, 0.225, 0);
    leg.castShadow = true;
    group.add(leg);
  });
  return group;
}
