import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { PALETTE } from './palette';
import { createEngravedPlaque, createLabelTexture } from './textures';
import { createCeilingFixture, createPlant, createTelephone, createWallSign, type TelephoneBuild } from './props';
import type { FloorContent } from './content';

/**
 * A through-car lift: you enter through the front doors and leave through
 * the rear ones, so the journey never asks the visitor to turn around.
 */

export const CAB = {
  halfWidth: 1.2,
  height: 2.8,
  frontZ: 0,
  backZ: -2.6,
  /** Where the camera stands inside the car. */
  centerZ: -1.3,
  doorClosedX: 0.6,
  doorOpenX: 1.26,
  doorHeight: 2.32,
  /** Right-hand wall, where the panel and telephone live. */
  panelWallX: 1.18,
} as const;

export type ElevatorButton = {
  dotMesh: THREE.Mesh;
  hitMesh: THREE.Mesh;
  floorId: FloorContent['id'];
  label: string;
  lit: boolean;
};

export type DoorPair = {
  left: THREE.Mesh;
  right: THREE.Mesh;
  /** 0 closed, 1 open. */
  openAmount: number;
};

export type ElevatorBuild = {
  group: THREE.Group;
  frontDoors: DoorPair;
  backDoors: DoorPair;
  buttons: ElevatorButton[];
  telephone: TelephoneBuild;
  logoPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  taglinePlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  floorReadout: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  setFloorReadout: (text: string) => void;
};

function buildDoorLeaf(materials: SceneMaterials, width: number) {
  const leaf = new THREE.Group();

  const panel = new THREE.Mesh(new THREE.BoxGeometry(width, CAB.doorHeight, 0.06), materials.steel);
  panel.castShadow = true;
  leaf.add(panel);

  // A recessed centre band catches the ceiling light and gives the steel
  // something to read against.
  const band = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, CAB.doorHeight - 0.5, 0.012), materials.steelDark);
  band.position.z = 0.032;
  leaf.add(band);

  const inner = new THREE.Mesh(new THREE.BoxGeometry(width - 0.16, CAB.doorHeight - 0.62, 0.014), materials.steel);
  inner.position.z = 0.038;
  leaf.add(inner);

  return leaf;
}

function buildDoorPair(materials: SceneMaterials, z: number, facing: 1 | -1): { group: THREE.Group; pair: DoorPair } {
  const group = new THREE.Group();
  const leafWidth = CAB.doorClosedX * 2;

  const left = buildDoorLeaf(materials, leafWidth);
  left.position.set(-CAB.doorClosedX, CAB.doorHeight / 2, z);
  const right = buildDoorLeaf(materials, leafWidth);
  right.position.set(CAB.doorClosedX, CAB.doorHeight / 2, z);
  right.rotation.y = Math.PI;

  group.add(left, right);

  // Surround, built as four bars rather than a slab — a solid box here would
  // sit in front of the leaves and hide them.
  const frameZ = z + 0.07 * facing;
  const jambWidth = 0.15;

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(CAB.halfWidth * 2 + jambWidth * 2, 0.16, 0.12),
    materials.steelDark,
  );
  head.position.set(0, CAB.doorHeight + 0.08, frameZ);
  group.add(head);

  [-1, 1].forEach((s) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(jambWidth, CAB.doorHeight + 0.16, 0.12), materials.steelDark);
    jamb.position.set(s * (CAB.halfWidth + jambWidth / 2), (CAB.doorHeight + 0.16) / 2, frameZ);
    group.add(jamb);
  });

  const sill = new THREE.Mesh(new THREE.BoxGeometry(CAB.halfWidth * 2 + jambWidth * 2, 0.03, 0.2), materials.brass);
  sill.position.set(0, 0.015, z);
  group.add(sill);

  return { group, pair: { left: left as unknown as THREE.Mesh, right: right as unknown as THREE.Mesh, openAmount: 0 } };
}

/** Applies an eased 0..1 open amount to a pair of centre-opening doors. */
export function setDoorOpen(pair: DoorPair, amount: number) {
  const travel = CAB.doorOpenX - CAB.doorClosedX;
  pair.openAmount = amount;
  pair.left.position.x = -CAB.doorClosedX - travel * amount;
  pair.right.position.x = CAB.doorClosedX + travel * amount;
}

export function buildElevator(materials: SceneMaterials, floors: FloorContent[]): ElevatorBuild {
  const group = new THREE.Group();

  // ─── Lobby side: wall the lift sits in, plus greenery ───
  const lobbyWallHeight = 3.6;
  const lobbyWallWidth = 9;
  const jambWidth = (lobbyWallWidth - CAB.halfWidth * 2 - 0.3) / 2;

  [-1, 1].forEach((side) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(jambWidth, lobbyWallHeight, 0.25), materials.wallCream);
    jamb.position.set(side * (CAB.halfWidth + 0.15 + jambWidth / 2), lobbyWallHeight / 2, 0.13);
    jamb.receiveShadow = true;
    group.add(jamb);
  });

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(lobbyWallWidth, lobbyWallHeight - CAB.doorHeight - 0.16, 0.25),
    materials.wallCream,
  );
  lintel.position.set(0, CAB.doorHeight + 0.16 + (lobbyWallHeight - CAB.doorHeight - 0.16) / 2, 0.13);
  group.add(lintel);

  // Navy band above the doors, carrying the floor readout.
  const band = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.44, 0.04), materials.wallNavy);
  band.position.set(0, CAB.doorHeight + 0.42, 0.26);
  group.add(band);

  const readoutTex = createLabelTexture('G', 256, 128, { fontSize: 74, color: '#cdcd00', weight: '600' });
  const floorReadout = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.17),
    new THREE.MeshBasicMaterial({ map: readoutTex, transparent: true }),
  );
  floorReadout.position.set(0, CAB.doorHeight + 0.42, 0.285);
  group.add(floorReadout);

  const setFloorReadout = (text: string) => {
    floorReadout.material.map?.dispose();
    floorReadout.material.map = createLabelTexture(text, 256, 128, {
      fontSize: 74,
      color: '#cdcd00',
      weight: '600',
    });
    floorReadout.material.needsUpdate = true;
  };

  // Engraved brand lockup on the closed doors, spanning both leaves.
  const logoTex = createEngravedPlaque('LYNKRS', 1024, 240, { fontSize: 128, letterSpacing: 18 });
  const logoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.35),
    new THREE.MeshStandardMaterial({ map: logoTex, roughness: 0.28, metalness: 0.8, transparent: true }),
  );
  logoPlane.position.set(0, 1.72, 0.041);
  group.add(logoPlane);

  const taglineTex = createLabelTexture('Turn motion into momentum.', 900, 90, {
    fontSize: 34,
    color: '#4a6180',
    weight: '400',
  });
  const taglinePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.35, 0.135),
    new THREE.MeshStandardMaterial({ map: taglineTex, roughness: 0.4, metalness: 0.6, transparent: true }),
  );
  taglinePlane.position.set(0, 1.46, 0.041);
  group.add(taglinePlane);

  // Plants flanking the lift, as asked.
  [-1, 1].forEach((side) => {
    const plant = createPlant(materials, 1.15);
    plant.position.set(side * (CAB.halfWidth + 0.62), 0, 0.52);
    group.add(plant);
  });

  // Lobby floor and ceiling, so the space reads as a room rather than a void.
  const lobbyFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), materials.floorStone);
  lobbyFloor.rotation.x = -Math.PI / 2;
  lobbyFloor.position.z = 7;
  lobbyFloor.receiveShadow = true;
  group.add(lobbyFloor);

  const lobbyCeiling = new THREE.Mesh(new THREE.PlaneGeometry(14, 16), materials.wallCream);
  lobbyCeiling.rotation.x = Math.PI / 2;
  lobbyCeiling.position.set(0, lobbyWallHeight, 7);
  group.add(lobbyCeiling);

  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, lobbyWallHeight), materials.wallCream);
    wall.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    wall.position.set(side * 7, lobbyWallHeight / 2, 7);
    group.add(wall);
  });

  for (let i = 0; i < 3; i++) {
    const fixture = createCeilingFixture(materials, 2.2, 0.3);
    fixture.position.set(0, lobbyWallHeight - 0.02, 2 + i * 4);
    group.add(fixture);
  }

  // ─── The car ───
  const cab = new THREE.Group();
  group.add(cab);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(CAB.halfWidth * 2, CAB.height, 0.1), materials.steel);
  backWall.position.set(0, CAB.height / 2, CAB.backZ - 0.05);
  cab.add(backWall);

  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, CAB.height, Math.abs(CAB.backZ) + 0.1),
      materials.steel,
    );
    wall.position.set(side * (CAB.halfWidth + 0.05), CAB.height / 2, CAB.backZ / 2);
    cab.add(wall);

    // Warm oak wainscot to break up the metal.
    const wainscot = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.85, Math.abs(CAB.backZ)),
      materials.wood,
    );
    wainscot.position.set(side * CAB.halfWidth, 0.5, CAB.backZ / 2);
    cab.add(wainscot);

    const railing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, Math.abs(CAB.backZ) - 0.2, 12),
      materials.brass,
    );
    railing.rotation.x = Math.PI / 2;
    railing.position.set(side * (CAB.halfWidth - 0.06), 0.95, CAB.backZ / 2);
    cab.add(railing);
  });

  const cabCeiling = new THREE.Mesh(new THREE.BoxGeometry(CAB.halfWidth * 2, 0.1, Math.abs(CAB.backZ)), materials.steelDark);
  cabCeiling.position.set(0, CAB.height + 0.05, CAB.backZ / 2);
  cab.add(cabCeiling);

  const cabFixture = createCeilingFixture(materials, 1.5, 0.85);
  cabFixture.position.set(0, CAB.height - 0.01, CAB.centerZ);
  cab.add(cabFixture);

  const cabFloor = new THREE.Mesh(new THREE.BoxGeometry(CAB.halfWidth * 2, 0.04, Math.abs(CAB.backZ)), materials.floorStone);
  cabFloor.position.set(0, 0.02, CAB.backZ / 2);
  cabFloor.receiveShadow = true;
  cab.add(cabFloor);

  // Engraved title on the back wall, seen on the way in.
  const titleTex = createEngravedPlaque('THE ELEVATOR PITCH', 1200, 200, { fontSize: 86, letterSpacing: 10 });
  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(1.85, 0.31),
    new THREE.MeshStandardMaterial({ map: titleTex, roughness: 0.3, metalness: 0.78 }),
  );
  title.position.set(0, 1.95, CAB.backZ + 0.002);
  cab.add(title);

  const titleRule = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 0.012), materials.accentYellow);
  titleRule.position.set(0, 1.75, CAB.backZ + 0.003);
  cab.add(titleRule);

  const subTex = createLabelTexture('Growth is designed, not guessed.', 900, 80, {
    fontSize: 34,
    color: '#4a6180',
    weight: '400',
  });
  const sub = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.13),
    new THREE.MeshStandardMaterial({ map: subTex, roughness: 0.4, metalness: 0.5, transparent: true }),
  );
  sub.position.set(0, 1.6, CAB.backZ + 0.003);
  cab.add(sub);

  // ─── Button panel, on the right-hand wall ───
  const panelGroup = new THREE.Group();
  panelGroup.position.set(CAB.panelWallX, 1.52, CAB.centerZ);
  panelGroup.rotation.y = -Math.PI / 2;
  cab.add(panelGroup);

  const panelPlate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.03), materials.steelDark);
  panelGroup.add(panelPlate);

  const panelSurround = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.78, 0.015), materials.brass);
  panelSurround.position.z = -0.012;
  panelGroup.add(panelSurround);

  const panelHeaderTex = createEngravedPlaque('SELECT A FLOOR', 512, 80, { fontSize: 34, letterSpacing: 5 });
  const panelHeader = new THREE.Mesh(
    new THREE.PlaneGeometry(0.44, 0.07),
    new THREE.MeshStandardMaterial({ map: panelHeaderTex, roughness: 0.35, metalness: 0.7 }),
  );
  panelHeader.position.set(0, 0.29, 0.017);
  panelGroup.add(panelHeader);

  const buttons: ElevatorButton[] = [];
  floors.forEach((floor, i) => {
    const y = 0.17 - i * 0.115;

    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 24), materials.brass);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(-0.19, y, 0.017);
    panelGroup.add(bezel);

    const dotMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.016, 24), materials.buttonOff.clone());
    dotMesh.rotation.x = Math.PI / 2;
    dotMesh.position.set(-0.19, y, 0.021);
    panelGroup.add(dotMesh);

    const numTex = createLabelTexture(floor.floorNumber, 128, 128, {
      fontSize: 62,
      color: '#183253',
      weight: '600',
    });
    const num = new THREE.Mesh(
      new THREE.PlaneGeometry(0.036, 0.036),
      new THREE.MeshBasicMaterial({ map: numTex, transparent: true }),
    );
    num.position.set(-0.19, y, 0.03);
    panelGroup.add(num);

    const lblTex = createLabelTexture(floor.buttonLabel, 420, 70, {
      fontSize: 34,
      color: '#e8ecf2',
      align: 'left',
      weight: '500',
    });
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.29, 0.048),
      new THREE.MeshBasicMaterial({ map: lblTex, transparent: true }),
    );
    lbl.position.set(0.025, y, 0.017);
    panelGroup.add(lbl);

    const hitMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.54, 0.105),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitMesh.position.set(-0.02, y, 0.03);
    hitMesh.userData = { kind: 'floorButton', floorId: floor.id };
    panelGroup.add(hitMesh);

    buttons.push({ dotMesh, hitMesh, floorId: floor.id, label: floor.buttonLabel, lit: false });
  });

  // ─── Telephone, directly below the panel ───
  const telephone = createTelephone(materials);
  telephone.group.position.set(CAB.panelWallX, 0.98, CAB.centerZ);
  telephone.group.rotation.y = -Math.PI / 2;
  cab.add(telephone.group);

  // ─── Doors ───
  const front = buildDoorPair(materials, CAB.frontZ, 1);
  group.add(front.group);
  const back = buildDoorPair(materials, CAB.backZ, -1);
  group.add(back.group);

  setDoorOpen(front.pair, 0);
  setDoorOpen(back.pair, 0);

  // Directory sign beside the lift, so the lobby explains itself.
  const sign = createWallSign('LYNKRS · GROWTH SYSTEMS', 1.5, 0.24);
  sign.position.set(-(CAB.halfWidth + 0.95), 1.62, 0.27);
  group.add(sign);

  return {
    group,
    frontDoors: front.pair,
    backDoors: back.pair,
    buttons,
    telephone,
    logoPlane,
    taglinePlane,
    floorReadout,
    setFloorReadout,
  };
}

export const ELEVATOR_PALETTE = PALETTE;
