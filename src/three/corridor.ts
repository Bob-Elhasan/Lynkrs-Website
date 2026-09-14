import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { PALETTE } from './palette';
import { createContentBoardTexture, createEngravedPlaque, createLabelTexture } from './textures';
import { createBench, createCeilingFixture, createPlant, createRunner, createWallSign } from './props';
import { disposeObject3D } from './dispose';
import type { DoorContent, FloorContent } from './content';

export const CORRIDOR = {
  halfWidth: 1.75,
  height: 2.9,
  /** First door sits this far down the corridor. */
  firstDoorZ: -5.5,
  doorSpacing: 4.4,
  /** How far past the last door the corridor runs before the return lift. */
  tailLength: 5.5,
  doorWidth: 1.05,
  doorHeight: 2.25,
  roomDepth: 4.6,
  roomWidth: 4.4,
} as const;

export type CorridorDoor = {
  content: DoorContent;
  /** -1 for the left-hand wall, +1 for the right. */
  side: 1 | -1;
  z: number;
  /** Hinge the leaf swings on. */
  pivot: THREE.Group;
  hitMesh: THREE.Mesh;
  room: THREE.Group;
  /** Where the camera stands to read the room, and the yaw to read it at. */
  viewPosition: THREE.Vector3;
  viewYaw: number;
  /** World-space point used to centre this door in frame from the corridor. */
  focusPoint: THREE.Vector3;
  isOpen: boolean;
};

export type CorridorBuild = {
  group: THREE.Group;
  doors: CorridorDoor[];
  /** z of the corridor's far end, where the return lift sits. */
  endZ: number;
  returnLiftHit: THREE.Mesh;
};

/**
 * One floor's corridor. Doors alternate left and right so the camera has a
 * reason to swing each way as the visitor scrolls, and each opens into a real
 * room with the content mounted on the wall straight ahead.
 */
export function buildCorridor(materials: SceneMaterials, floor: FloorContent): CorridorBuild {
  const group = new THREE.Group();
  const doorCount = floor.doors.length;
  const lastDoorZ = CORRIDOR.firstDoorZ - (doorCount - 1) * CORRIDOR.doorSpacing;
  const endZ = lastDoorZ - CORRIDOR.tailLength;
  const length = Math.abs(endZ) + 2;
  const midZ = endZ / 2;

  // ─── Shell ───
  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR.halfWidth * 2, length), materials.floorStone);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(0, 0, midZ);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  const runner = createRunner(materials, 1.5, length - 1.5);
  runner.position.z = midZ;
  group.add(runner);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR.halfWidth * 2, length), materials.wallCream);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, CORRIDOR.height, midZ);
  group.add(ceiling);

  [-1, 1].forEach((side) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(length, CORRIDOR.height), materials.wallCream);
    wall.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    wall.position.set(side * CORRIDOR.halfWidth, CORRIDOR.height / 2, midZ);
    wall.receiveShadow = true;
    group.add(wall);

    const skirting = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, length), materials.wallNavy);
    skirting.position.set(side * (CORRIDOR.halfWidth - 0.015), 0.06, midZ);
    group.add(skirting);
  });

  const fixtureCount = Math.max(3, Math.ceil(length / 3.2));
  for (let i = 0; i < fixtureCount; i++) {
    const z = -1.5 - i * (length / fixtureCount);
    const fixture = createCeilingFixture(materials, 1.2, 0.26);
    fixture.position.set(0, CORRIDOR.height - 0.01, z);
    group.add(fixture);

    const bulb = new THREE.PointLight(PALETTE.lightWarm, 1.9, 7, 2);
    bulb.position.set(0, CORRIDOR.height - 0.35, z);
    group.add(bulb);
  }

  const sign = createWallSign(floor.signage, 1.7, 0.26);
  sign.position.set(0, 2.2, -2.6);
  group.add(sign);

  // ─── Doors and rooms ───
  const doors: CorridorDoor[] = floor.doors.map((content, i) => {
    const side: 1 | -1 = i % 2 === 0 ? -1 : 1;
    const z = CORRIDOR.firstDoorZ - i * CORRIDOR.doorSpacing;
    return buildDoorway(materials, content, group, side, z);
  });

  // ─── Far end ───
  const endWall = new THREE.Mesh(
    new THREE.PlaneGeometry(CORRIDOR.halfWidth * 2, CORRIDOR.height),
    materials.wallCream,
  );
  endWall.position.set(0, CORRIDOR.height / 2, endZ);
  group.add(endWall);

  const returnLift = buildReturnLift(materials, endZ);
  group.add(returnLift.group);

  const closingTex = createLabelTexture(floor.closing, 1100, 120, {
    fontSize: 44,
    color: '#4a6180',
    weight: '400',
  });
  const closing = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.21),
    new THREE.MeshBasicMaterial({ map: closingTex, transparent: true }),
  );
  closing.position.set(0, 2.52, endZ + 0.02);
  group.add(closing);

  [-1, 1].forEach((side) => {
    const plant = createPlant(materials, 1.05);
    plant.position.set(side * (CORRIDOR.halfWidth - 0.42), 0, endZ + 1.2);
    group.add(plant);
  });

  const bench = createBench(materials);
  bench.position.set(CORRIDOR.halfWidth - 0.35, 0, endZ + 2.6);
  bench.rotation.y = Math.PI / 2;
  group.add(bench);

  return { group, doors, endZ, returnLiftHit: returnLift.hitMesh };
}

function buildDoorway(
  materials: SceneMaterials,
  content: DoorContent,
  parent: THREE.Group,
  side: 1 | -1,
  z: number,
): CorridorDoor {
  const group = new THREE.Group();
  group.position.set(side * CORRIDOR.halfWidth, 0, z);
  // Local +Z points back into the corridor, so both walls build identically.
  group.rotation.y = side === 1 ? -Math.PI / 2 : Math.PI / 2;
  parent.add(group);

  const frameDepth = 0.16;
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(CORRIDOR.doorWidth + 0.24, 0.12, frameDepth),
    materials.woodDark,
  );
  top.position.set(0, CORRIDOR.doorHeight + 0.06, 0);
  group.add(top);

  [-1, 1].forEach((s) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(0.12, CORRIDOR.doorHeight, frameDepth), materials.woodDark);
    jamb.position.set(s * (CORRIDOR.doorWidth / 2 + 0.06), CORRIDOR.doorHeight / 2, 0);
    group.add(jamb);
  });

  // Hinged wooden leaf.
  const pivot = new THREE.Group();
  pivot.position.set(-CORRIDOR.doorWidth / 2, 0, 0);
  group.add(pivot);

  const leaf = new THREE.Mesh(
    new THREE.BoxGeometry(CORRIDOR.doorWidth, CORRIDOR.doorHeight, 0.055),
    materials.wood,
  );
  leaf.position.set(CORRIDOR.doorWidth / 2, CORRIDOR.doorHeight / 2, 0);
  leaf.castShadow = true;
  pivot.add(leaf);

  [0.62, 1.62].forEach((y) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(CORRIDOR.doorWidth - 0.26, 0.78, 0.012),
      materials.woodDark,
    );
    panel.position.set(CORRIDOR.doorWidth / 2, y, 0.032);
    pivot.add(panel);
  });

  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.12, 4, 10), materials.brass);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(CORRIDOR.doorWidth - 0.14, 1.06, 0.07);
  pivot.add(handle);

  const plaqueTex = createEngravedPlaque(`${content.roomCode}   ${content.label.toUpperCase()}`, 760, 110, {
    fontSize: 40,
    letterSpacing: 4,
  });
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.78, 0.113),
    new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.32, metalness: 0.74 }),
  );
  plaque.position.set(0, CORRIDOR.doorHeight + 0.26, 0.01);
  group.add(plaque);

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CORRIDOR.doorWidth + 0.3, CORRIDOR.doorHeight),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, CORRIDOR.doorHeight / 2, 0.12);
  hitMesh.userData = { kind: 'corridorDoor', roomCode: content.roomCode };
  group.add(hitMesh);

  // ─── The room behind the door ───
  const room = new THREE.Group();
  room.position.set(0, 0, -0.18);
  group.add(room);

  const rw = CORRIDOR.roomWidth;
  const rd = CORRIDOR.roomDepth;

  const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(rw, rd), materials.floorStone);
  roomFloor.rotation.x = -Math.PI / 2;
  roomFloor.position.set(0, 0.001, -rd / 2);
  roomFloor.receiveShadow = true;
  room.add(roomFloor);

  const roomCeiling = new THREE.Mesh(new THREE.PlaneGeometry(rw, rd), materials.wallCream);
  roomCeiling.rotation.x = Math.PI / 2;
  roomCeiling.position.set(0, CORRIDOR.height, -rd / 2);
  room.add(roomCeiling);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(rw, CORRIDOR.height), materials.wallCream);
  backWall.position.set(0, CORRIDOR.height / 2, -rd);
  backWall.receiveShadow = true;
  room.add(backWall);

  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(rd, CORRIDOR.height), materials.wallCream);
    wall.rotation.y = s === 1 ? -Math.PI / 2 : Math.PI / 2;
    wall.position.set(s * (rw / 2), CORRIDOR.height / 2, -rd / 2);
    room.add(wall);
  });

  // Entry wall either side of the doorway, so the room feels enclosed.
  const sideWidth = (rw - CORRIDOR.doorWidth - 0.24) / 2;
  [-1, 1].forEach((s) => {
    const filler = new THREE.Mesh(new THREE.PlaneGeometry(sideWidth, CORRIDOR.height), materials.wallCream);
    filler.rotation.y = Math.PI;
    filler.position.set(s * (CORRIDOR.doorWidth / 2 + 0.12 + sideWidth / 2), CORRIDOR.height / 2, 0);
    room.add(filler);
  });

  // Content board on the far wall — dead ahead as you walk in.
  const boardTex = createContentBoardTexture(content.kicker, content.title, content.body, content.bullets);
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(3.36, 2.16, 0.05), materials.woodDark);
  boardFrame.position.set(0, 1.55, -rd + 0.03);
  room.add(boardFrame);

  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.0),
    new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.62, metalness: 0.02 }),
  );
  board.position.set(0, 1.55, -rd + 0.058);
  room.add(board);

  const rule = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.022), materials.accentYellow);
  rule.position.set(0, 0.4, -rd + 0.04);
  room.add(rule);

  const roomLight = new THREE.PointLight(PALETTE.lightWarm, 2.3, 9, 2);
  roomLight.position.set(0, CORRIDOR.height - 0.45, -rd / 2);
  room.add(roomLight);

  const roomFixture = createCeilingFixture(materials, 1.4, 0.3);
  roomFixture.position.set(0, CORRIDOR.height - 0.01, -rd / 2 + 0.4);
  room.add(roomFixture);

  const plant = createPlant(materials, 1);
  plant.position.set(rw / 2 - 0.55, 0, -rd + 0.6);
  room.add(plant);

  /**
   * Doorway-local to corridor-local, done by hand. localToWorld would need
   * the matrices to have been updated by a render first, and these objects
   * have never been drawn yet.
   *
   * The doorway is yawed +/-90 degrees, so its local +Z points back into the
   * corridor and local X runs along the wall.
   */
  const toCorridor = (localZ: number, y: number) =>
    new THREE.Vector3(side * CORRIDOR.halfWidth - side * localZ, y, z);

  const roomOffset = -0.18;
  const viewPosition = toCorridor(roomOffset - rd + 2.7, 0);
  const boardPoint = toCorridor(roomOffset - rd, 1.55);
  const focusPoint = toCorridor(0, CORRIDOR.doorHeight / 2);

  return {
    content,
    side,
    z,
    pivot,
    hitMesh,
    room,
    viewPosition,
    viewYaw: Math.atan2(-(boardPoint.x - viewPosition.x), -(boardPoint.z - viewPosition.z)),
    focusPoint,
    isOpen: false,
  };
}

/** The lift at the far end that carries the visitor back to the lobby. */
function buildReturnLift(materials: SceneMaterials, endZ: number) {
  const group = new THREE.Group();
  group.position.set(0, 0, endZ + 0.02);

  const surround = new THREE.Mesh(new THREE.BoxGeometry(1.94, 2.52, 0.1), materials.steelDark);
  surround.position.set(0, 1.26, 0.04);
  group.add(surround);

  const doors = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.32, 0.06), materials.steel);
  doors.position.set(0, 1.16, 0.09);
  group.add(doors);

  const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 2.3), new THREE.MeshBasicMaterial({ color: 0x7f8891 }));
  seam.position.set(0, 1.16, 0.121);
  group.add(seam);

  const callTex = createEngravedPlaque('RETURN TO LOBBY', 700, 110, { fontSize: 40, letterSpacing: 5 });
  const call = new THREE.Mesh(
    new THREE.PlaneGeometry(0.94, 0.148),
    new THREE.MeshStandardMaterial({ map: callTex, roughness: 0.32, metalness: 0.74 }),
  );
  call.position.set(0, 2.0, 0.122);
  group.add(call);

  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24), materials.accentYellow);
  button.rotation.x = Math.PI / 2;
  button.position.set(1.06, 1.25, 0.08);
  group.add(button);

  const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 8, 24), materials.brass);
  bezel.position.set(1.06, 1.25, 0.075);
  group.add(bezel);

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.5),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.25, 0.14);
  hitMesh.userData = { kind: 'returnLift' };
  group.add(hitMesh);

  return { group, hitMesh };
}

export function disposeCorridor(corridor: CorridorBuild) {
  disposeObject3D(corridor.group);
}
