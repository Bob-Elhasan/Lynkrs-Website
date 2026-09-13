import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { createLabelTexture, createPanelTexture } from './textures';
import type { DoorContent, FloorContent } from './content';
import { disposeObject3D } from './dispose';

export type CorridorDoor = {
  content: DoorContent;
  doorGroup: THREE.Group;
  panelMesh: THREE.Mesh;
  revealMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  closedX: number;
  openX: number;
  side: 1 | -1;
  isOpen: boolean;
};

export type CorridorBuild = {
  group: THREE.Group;
  doors: CorridorDoor[];
  length: number;
  signagePlane: THREE.Mesh;
};

const CORRIDOR_WIDTH = 3;
const CORRIDOR_HEIGHT = 2.8;
const PAIR_SPACING = 4;
const START_Z = -2;

/** Builds a corridor for one floor: walls, lights, and its labelled doors. */
export function buildCorridor(materials: SceneMaterials, floor: FloorContent): CorridorBuild {
  const group = new THREE.Group();
  const doorCount = floor.doors.length;
  const pairs = Math.max(1, Math.ceil(doorCount / 2));
  const length = Math.max(10, START_Z * -1 + pairs * PAIR_SPACING + 4);

  const corrFloor = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_WIDTH, length), materials.marbleFloor);
  corrFloor.rotation.x = -Math.PI / 2;
  corrFloor.position.set(0, 0.01, -length / 2 + 1);
  corrFloor.receiveShadow = true;
  group.add(corrFloor);

  const corrCeiling = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_WIDTH, length), materials.wallInterior);
  corrCeiling.rotation.x = Math.PI / 2;
  corrCeiling.position.set(0, CORRIDOR_HEIGHT, -length / 2 + 1);
  group.add(corrCeiling);

  const corrWallL = new THREE.Mesh(new THREE.PlaneGeometry(length, CORRIDOR_HEIGHT), materials.wallInterior);
  corrWallL.rotation.y = Math.PI / 2;
  corrWallL.position.set(-CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -length / 2 + 1);
  const corrWallR = new THREE.Mesh(new THREE.PlaneGeometry(length, CORRIDOR_HEIGHT), materials.wallInterior);
  corrWallR.rotation.y = -Math.PI / 2;
  corrWallR.position.set(CORRIDOR_WIDTH / 2, CORRIDOR_HEIGHT / 2, -length / 2 + 1);
  group.add(corrWallL, corrWallR);

  const lightCount = Math.max(3, pairs + 1);
  for (let i = 0; i < lightCount; i++) {
    const z = -1 - i * (length / lightCount);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 0.15), materials.emissivePanel);
    strip.position.set(0, CORRIDOR_HEIGHT - 0.02, z);
    group.add(strip);
    const pl = new THREE.PointLight(0xfff5e0, 0.5, 4.5);
    pl.position.set(0, CORRIDOR_HEIGHT - 0.3, z);
    group.add(pl);
  }

  const signageTexture = createLabelTexture(floor.signage, 900, 100, {
    fontSize: 30,
    color: '#c8a85c',
    font: 'Georgia, serif',
    letterSpacing: 3,
  });
  const signagePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.18),
    new THREE.MeshBasicMaterial({ map: signageTexture, transparent: true }),
  );
  signagePlane.position.set(0, 2.1, -0.6);
  group.add(signagePlane);

  const doors: CorridorDoor[] = [];

  if (doorCount === 1) {
    doors.push(buildDoorInWall(materials, floor.doors[0], group, -(length - 1.4)));
  } else {
    floor.doors.forEach((content, i) => {
      const side: 1 | -1 = i % 2 === 0 ? -1 : 1;
      const z = START_Z - Math.floor(i / 2) * PAIR_SPACING;
      doors.push(buildDoorOnWall(materials, content, group, side, z));
    });
  }

  const corrEnd = new THREE.Mesh(new THREE.PlaneGeometry(CORRIDOR_WIDTH, CORRIDOR_HEIGHT), materials.wallInterior);
  corrEnd.position.set(0, CORRIDOR_HEIGHT / 2, -length + 1);
  group.add(corrEnd);

  return { group, doors, length, signagePlane };
}

function buildDoorOnWall(
  materials: SceneMaterials,
  content: DoorContent,
  parent: THREE.Group,
  side: 1 | -1,
  z: number,
): CorridorDoor {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(side * (CORRIDOR_WIDTH / 2), 0, z);
  doorGroup.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
  parent.add(doorGroup);

  const frameT = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.12), materials.darkSteel);
  frameT.position.set(0, 2.34, 0);
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.12), materials.darkSteel);
  frameL.position.set(-0.54, 1.15, 0);
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.12), materials.darkSteel);
  frameR.position.set(0.54, 1.15, 0);
  const frameTrim = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.02, 0.13), materials.gold);
  frameTrim.position.set(0, 2.3, 0.001);
  doorGroup.add(frameT, frameL, frameR, frameTrim);

  const closedX = 0;
  const openX = -0.85;
  const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.3, 0.05), materials.doorPanel.clone());
  panelMesh.position.set(closedX, 1.15, 0);
  panelMesh.userData = { roomCode: content.roomCode, label: content.label };
  doorGroup.add(panelMesh);

  const doorLblTexture = createLabelTexture(content.label, 512, 96, {
    fontSize: 34,
    color: content.accent,
    font: 'Georgia, serif',
  });
  const doorLbl = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.13),
    new THREE.MeshBasicMaterial({ map: doorLblTexture, transparent: true }),
  );
  doorLbl.position.set(0, 1.78, 0.03);
  doorGroup.add(doorLbl);

  const numTexture = createLabelTexture(content.roomCode, 160, 64, { fontSize: 30, color: '#8a8a86' });
  const numPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.08),
    new THREE.MeshBasicMaterial({ map: numTexture, transparent: true }),
  );
  numPlane.position.set(0, 2.08, 0.03);
  doorGroup.add(numPlane);

  const panelTexture = createPanelTexture(content.title, content.body, 1024, 720, content.accent);
  const revealMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 2.2),
    new THREE.MeshBasicMaterial({ map: panelTexture, transparent: true, opacity: 0 }),
  );
  revealMesh.position.set(0.02, 1.15, -0.04);
  revealMesh.visible = false;
  doorGroup.add(revealMesh);

  return { content, doorGroup, panelMesh, revealMesh, closedX, openX, side, isOpen: false };
}

/** A single door set flush into the end wall, used for one-door floors like Contact. */
function buildDoorInWall(materials: SceneMaterials, content: DoorContent, parent: THREE.Group, z: number): CorridorDoor {
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0, 0, z);
  parent.add(doorGroup);

  const frameT = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.12), materials.darkSteel);
  frameT.position.set(0, 2.5, 0);
  const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.12), materials.darkSteel);
  frameL.position.set(-0.74, 1.25, 0);
  const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 0.12), materials.darkSteel);
  frameR.position.set(0.74, 1.25, 0);
  const frameTrim = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.02, 0.13), materials.gold);
  frameTrim.position.set(0, 2.46, 0.001);
  doorGroup.add(frameT, frameL, frameR, frameTrim);

  const closedX = 0;
  const openX = -1.1;
  const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.35, 2.4, 0.06), materials.doorPanel.clone());
  panelMesh.position.set(closedX, 1.2, 0);
  panelMesh.userData = { roomCode: content.roomCode, label: content.label };
  doorGroup.add(panelMesh);

  const doorLblTexture = createLabelTexture(content.label, 640, 110, {
    fontSize: 42,
    color: content.accent,
    font: 'Georgia, serif',
  });
  const doorLbl = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.17),
    new THREE.MeshBasicMaterial({ map: doorLblTexture, transparent: true }),
  );
  doorLbl.position.set(0, 1.95, 0.04);
  doorGroup.add(doorLbl);

  const panelTexture = createPanelTexture(content.title, content.body, 1024, 720, content.accent);
  const revealMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 2.3),
    new THREE.MeshBasicMaterial({ map: panelTexture, transparent: true, opacity: 0 }),
  );
  revealMesh.position.set(0.03, 1.2, -0.05);
  revealMesh.visible = false;
  doorGroup.add(revealMesh);

  return { content, doorGroup, panelMesh, revealMesh, closedX, openX, side: 1, isOpen: false };
}

export function disposeCorridor(corridor: CorridorBuild) {
  disposeObject3D(corridor.group);
}
