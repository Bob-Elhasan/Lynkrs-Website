import * as THREE from 'three';
import type { SceneMaterials } from './materials';
import { createLabelTexture } from './textures';
import type { FloorContent } from './content';

export type ElevatorButton = {
  /** The small visible puck; its material swaps to show the lit state. */
  dotMesh: THREE.Mesh;
  /** A larger invisible plane used for raycasting, so the tap target stays comfortable. */
  hitMesh: THREE.Mesh;
  label: string;
  floorId: FloorContent['id'];
  lit: boolean;
};

export type ElevatorBuild = {
  group: THREE.Group;
  doorLeft: THREE.Mesh;
  doorRight: THREE.Mesh;
  seam: THREE.Mesh;
  logoPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  taglinePlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  interiorGroup: THREE.Group;
  buttons: ElevatorButton[];
  ceilingLight: THREE.Mesh;
  interiorDoorLeft: THREE.Mesh;
  interiorDoorRight: THREE.Mesh;
};

const DOOR_HALF_WIDTH = 0.55;
const DOOR_HEIGHT = 2.5;
const DOOR_OPEN_OFFSET = 0.62;

/** Builds the exterior lobby: doors, frame, engraved logo, surrounding wall. */
export function buildElevatorExterior(materials: SceneMaterials): {
  group: THREE.Group;
  doorLeft: THREE.Mesh;
  doorRight: THREE.Mesh;
  seam: THREE.Mesh;
  logoPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  taglinePlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
} {
  const group = new THREE.Group();

  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.15, 0.3), materials.darkSteel);
  frameTop.position.set(0, 2.65, 0);
  const frameBottom = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 0.3), materials.darkSteel);
  frameBottom.position.set(0, 0.05, 0);
  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.7, 0.3), materials.darkSteel);
  frameLeft.position.set(-1.225, 1.35, 0);
  const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.7, 0.3), materials.darkSteel);
  frameRight.position.set(1.225, 1.35, 0);
  group.add(frameTop, frameBottom, frameLeft, frameRight);

  // Gold trim strip around the frame.
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.66, 2.76, 0.04), materials.gold);
  trim.position.set(0, 1.35, -0.14);
  group.add(trim);

  const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(1.1, DOOR_HEIGHT, 0.05), materials.steel);
  doorLeft.position.set(-DOOR_HALF_WIDTH, 1.35, 0);
  doorLeft.castShadow = true;
  const doorRight = new THREE.Mesh(new THREE.BoxGeometry(1.1, DOOR_HEIGHT, 0.05), materials.steel);
  doorRight.position.set(DOOR_HALF_WIDTH, 1.35, 0);
  doorRight.castShadow = true;
  group.add(doorLeft, doorRight);

  const seam = new THREE.Mesh(new THREE.PlaneGeometry(0.006, DOOR_HEIGHT), new THREE.MeshBasicMaterial({ color: 0x0a0a0a }));
  seam.position.set(0, 1.35, 0.03);
  group.add(seam);

  const logoTexture = createLabelTexture('LYNKRS', 512, 128, {
    fontSize: 58,
    color: '#c8a85c',
    font: 'Georgia, serif',
    letterSpacing: 6,
  });
  const logoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.3),
    new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true }),
  );
  logoPlane.position.set(0, 1.85, 0.04);
  group.add(logoPlane);

  const taglineTexture = createLabelTexture('Turn motion into momentum.', 640, 72, {
    fontSize: 22,
    color: '#9a9a94',
    font: 'Georgia, serif',
  });
  const taglinePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 0.17),
    new THREE.MeshBasicMaterial({ map: taglineTexture, transparent: true }),
  );
  taglinePlane.position.set(0, 1.6, 0.04);
  group.add(taglinePlane);

  return { group, doorLeft, doorRight, seam, logoPlane, taglinePlane };
}

/** Builds the elevator interior: walls, ceiling, title, and the button console. */
export function buildElevatorInterior(materials: SceneMaterials, floors: FloorContent[]) {
  const interiorGroup = new THREE.Group();
  interiorGroup.position.set(0, 0, -1.5);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.7, 0.1), materials.wallInterior);
  backWall.position.set(0, 1.35, -1.2);
  const sideWallL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.7, 2.5), materials.wallInterior);
  sideWallL.position.set(-1.1, 1.35, 0);
  const sideWallR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.7, 2.5), materials.wallInterior);
  sideWallR.position.set(1.1, 1.35, 0);
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 2.5), materials.wallInterior);
  ceiling.position.set(0, 2.7, 0);
  const intFloor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 2.5), materials.floorPolished);
  intFloor.position.set(0, 0.025, 0);
  intFloor.receiveShadow = true;
  interiorGroup.add(backWall, sideWallL, sideWallR, ceiling, intFloor);

  // Interior sliding doors (visually separate from exterior doors so the cab
  // reads as its own enclosed box once the camera passes the threshold).
  const interiorDoorLeft = new THREE.Mesh(new THREE.BoxGeometry(1.08, DOOR_HEIGHT, 0.04), materials.steel);
  interiorDoorLeft.position.set(-DOOR_HALF_WIDTH, 1.35, 1.47);
  const interiorDoorRight = new THREE.Mesh(new THREE.BoxGeometry(1.08, DOOR_HEIGHT, 0.04), materials.steel);
  interiorDoorRight.position.set(DOOR_HALF_WIDTH, 1.35, 1.47);
  interiorGroup.add(interiorDoorLeft, interiorDoorRight);

  const ceilingLight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.02, 0.3), materials.emissivePanel);
  ceilingLight.position.set(0, 2.68, 0);
  interiorGroup.add(ceilingLight);

  const titleTexture = createLabelTexture('The Elevator Pitch', 900, 140, {
    fontSize: 56,
    color: '#c8a85c',
    font: 'Georgia, serif',
  });
  const titlePlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.9, 0.3),
    new THREE.MeshBasicMaterial({ map: titleTexture, transparent: true }),
  );
  titlePlane.position.set(0, 2.0, -1.14);
  interiorGroup.add(titlePlane);

  const titleLine = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.004), materials.gold);
  titleLine.position.set(0, 1.82, -1.14);
  interiorGroup.add(titleLine);

  const subTexture = createLabelTexture('Growth is designed, not guessed.', 900, 90, {
    fontSize: 26,
    color: '#8f8f89',
    font: 'Georgia, serif',
  });
  const subPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.16),
    new THREE.MeshBasicMaterial({ map: subTexture, transparent: true }),
  );
  subPlane.position.set(0, 1.68, -1.14);
  interiorGroup.add(subPlane);

  // Button console.
  const panelGroup = new THREE.Group();
  panelGroup.position.set(0.9, 1.3, -0.3);
  panelGroup.rotation.y = -Math.PI / 2;
  interiorGroup.add(panelGroup);

  const panelBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.02), materials.darkSteel);
  panelGroup.add(panelBack);
  const panelTrim = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.64, 0.015), materials.gold);
  panelTrim.position.z = -0.006;
  panelGroup.add(panelTrim);

  const buttons: ElevatorButton[] = [];
  floors.forEach((floor, i) => {
    const yPos = 0.2 - i * 0.13;
    const btnGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.016, 20);
    const btnMesh = new THREE.Mesh(btnGeo, materials.buttonOff.clone());
    btnMesh.rotation.x = Math.PI / 2;
    btnMesh.position.set(-0.09, yPos, 0.016);
    btnMesh.userData = { floorId: floor.id, label: floor.buttonLabel };
    panelGroup.add(btnMesh);

    const lblTexture = createLabelTexture(floor.buttonLabel, 320, 56, {
      fontSize: 26,
      color: '#a9a9a3',
      font: 'Georgia, serif',
      align: 'left',
    });
    const lblPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.19, 0.033),
      new THREE.MeshBasicMaterial({ map: lblTexture, transparent: true }),
    );
    lblPlane.position.set(0.035, yPos, 0.016);
    panelGroup.add(lblPlane);

    // A generous invisible hit-plane covering the dot + full label width, so
    // the tap target is comfortable even though the physical button reads small.
    const hitMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.13),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    hitMesh.position.set(0.06, yPos, 0.02);
    hitMesh.userData = { floorId: floor.id, label: floor.buttonLabel };
    panelGroup.add(hitMesh);

    buttons.push({ dotMesh: btnMesh, hitMesh, label: floor.buttonLabel, floorId: floor.id, lit: false });
  });

  return { interiorGroup, buttons, ceilingLight, interiorDoorLeft, interiorDoorRight };
}

export function buildElevator(materials: SceneMaterials, floors: FloorContent[]): ElevatorBuild {
  const exterior = buildElevatorExterior(materials);
  const interior = buildElevatorInterior(materials, floors);
  exterior.group.add(interior.interiorGroup);
  return {
    group: exterior.group,
    doorLeft: exterior.doorLeft,
    doorRight: exterior.doorRight,
    seam: exterior.seam,
    logoPlane: exterior.logoPlane,
    taglinePlane: exterior.taglinePlane,
    interiorGroup: interior.interiorGroup,
    buttons: interior.buttons,
    ceilingLight: interior.ceilingLight,
    interiorDoorLeft: interior.interiorDoorLeft,
    interiorDoorRight: interior.interiorDoorRight,
  };
}

export const ELEVATOR_CONSTANTS = { DOOR_HALF_WIDTH, DOOR_HEIGHT, DOOR_OPEN_OFFSET };
