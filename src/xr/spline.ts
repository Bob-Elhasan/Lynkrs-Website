/**
 * The journey path.
 *
 * The 01–07 narrative is laid out as stations in one continuous corridor. The
 * camera rides a Catmull-Rom curve through them, so scrolling is a flight and
 * routing is a jump to a named point on the same curve. There is only ever one
 * path; pages are positions on it.
 */

import { CatmullRomCurve3, Vector3 } from 'three';

import type { StationId } from '@/content/journey';

export type Station = {
  id: StationId;
  /** Where the camera comes to rest. */
  position: Vector3;
  /** What it faces from there. */
  lookAt: Vector3;
  /** Route that maps to this station, if any. */
  route?: string;
  label: string;
};

/**
 * Stations descend and weave so the corridor never reads as a straight tube.
 * Z is the direction of travel; the lateral and vertical offsets give the
 * camera something to bank around.
 */
export const stations: Station[] = [
  {
    id: 'arrival',
    position: new Vector3(0, 0, 6),
    lookAt: new Vector3(0, 0, -8),
    route: '/',
    label: 'Arrival',
  },
  {
    id: 'problem',
    position: new Vector3(0.5, -1.6, -28),
    lookAt: new Vector3(0, -2, -42),
    label: 'The problem',
  },
  {
    id: 'positioning',
    position: new Vector3(5.5, -3, -58),
    lookAt: new Vector3(2, -3.4, -72),
    label: 'Our positioning',
  },
  {
    id: 'principles',
    position: new Vector3(-4, -4.2, -90),
    lookAt: new Vector3(-1, -4.6, -104),
    label: 'How we think',
  },
  {
    id: 'method',
    position: new Vector3(0, -6, -126),
    lookAt: new Vector3(0, -6.4, -140),
    route: '/services',
    label: 'How we work',
  },
  {
    id: 'suite',
    position: new Vector3(7, -8, -164),
    lookAt: new Vector3(3, -8.4, -178),
    route: '/bundles',
    label: 'The Growth Suite',
  },
  {
    id: 'modules',
    position: new Vector3(-5.5, -10, -202),
    lookAt: new Vector3(-2, -10.4, -216),
    route: '/portfolio',
    label: 'What we run',
  },
  {
    id: 'together',
    position: new Vector3(0, -12, -238),
    lookAt: new Vector3(0, -12.4, -252),
    label: 'How we work together',
  },
  {
    id: 'contact',
    position: new Vector3(0, -13, -270),
    lookAt: new Vector3(0, -13.2, -284),
    route: '/contact',
    label: 'Start a conversation',
  },
];

export const journeyCurve = new CatmullRomCurve3(
  stations.map((s) => s.position),
  false,
  'catmullrom',
  0.4,
);

export const lookCurve = new CatmullRomCurve3(
  stations.map((s) => s.lookAt),
  false,
  'catmullrom',
  0.4,
);

/** Normalised position (0–1) of each station along the curve. */
export const stationT: Record<StationId, number> = stations.reduce(
  (acc, station, index) => {
    acc[station.id] = index / (stations.length - 1);
    return acc;
  },
  {} as Record<StationId, number>,
);

/** Which station a route lands on. Unknown routes start at arrival. */
export function stationForRoute(pathname: string): Station {
  const clean = pathname.replace(/\/+$/, '') || '/';

  // Service detail pages sit at the modules station.
  if (clean.startsWith('/services/')) {
    return stations.find((s) => s.id === 'modules') ?? stations[0];
  }
  if (clean.startsWith('/portfolio')) {
    return stations.find((s) => s.id === 'modules') ?? stations[0];
  }

  return stations.find((s) => s.route === clean) ?? stations[0];
}

/** Nearest station to a normalised curve position, for scroll-driven state. */
export function stationAtT(t: number): Station {
  const index = Math.round(t * (stations.length - 1));
  return stations[Math.min(stations.length - 1, Math.max(0, index))];
}

const _pos = new Vector3();
const _look = new Vector3();

/** Samples camera position and look target at a normalised point on the path. */
export function sampleJourney(t: number): { position: Vector3; lookAt: Vector3 } {
  const clamped = Math.min(1, Math.max(0, t));
  journeyCurve.getPointAt(clamped, _pos);
  lookCurve.getPointAt(clamped, _look);
  return { position: _pos, lookAt: _look };
}
