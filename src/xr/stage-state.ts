import { useSyncExternalStore } from 'react';

/**
 * Whether the 3D corridor is actually running.
 *
 * The layout needs this to decide how to present the DOM mirror: alongside the
 * canvas as the accessible copy of record, or as the visible site when WebGL
 * is unavailable. Kept as a tiny external store rather than context so the
 * lazy-loaded stage can publish into it without the app tree knowing it exists.
 */

let active = false;
const listeners = new Set<() => void>();

export function setStageActive(next: boolean): void {
  if (active === next) return;
  active = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStageActive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => active,
    // Prerender and first paint always assume no canvas, so the mirror is the
    // visible site until the stage proves it can run.
    () => false,
  );
}
