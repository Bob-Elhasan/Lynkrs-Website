/**
 * IWSDK world bootstrap.
 *
 * IWSDK owns the WebGL renderer, the scene, the camera, XR session management,
 * input and the render loop. React Three Fiber is then attached to those same
 * objects (see stage.tsx) purely as a declarative authoring layer — it never
 * creates a second renderer and never drives a second loop.
 *
 * `xr: { offer: 'once' }` keeps the flat-browser path primary, which is what
 * almost every visitor is on, while still offering the immersive session to
 * headsets that can take it.
 */

import { World, SessionMode, type WorldOptions } from '@iwsdk/core';

let worldPromise: Promise<World> | null = null;

export function createWorld(container: HTMLElement): Promise<World> {
  // A second World would mean a second WebGL context fighting the first.
  if (worldPromise) return worldPromise;

  const options: WorldOptions = {
    xr: {
      sessionMode: SessionMode.ImmersiveVR,
      offer: 'once',
      features: {
        handTracking: { required: false },
      },
    },
    render: {
      fov: 50,
      near: 0.1,
      far: 600,
      camera: { position: [0, 0, 6] },
    },
    input: {
      // Forward DOM pointer events into the scene so the spatial UI panels are
      // clickable. Camera movement stays ours, driven by scroll and routing.
      canvasPointerEvents: { enabled: true, activeDuringXR: true },
    },
    features: {
      locomotion: {
        // Only meaningful inside a headset; the flat path is scroll-driven.
        browserControls: false,
        initialPlayerPosition: [0, 0, 6],
      },
      grabbing: false,
    },
  };

  worldPromise = World.create(container, options);
  return worldPromise;
}

export function getWorld(): Promise<World> | null {
  return worldPromise;
}

export function destroyWorld(): void {
  const pending = worldPromise;
  worldPromise = null;
  void pending?.then((world) => world.destroy()).catch(() => {
    // Teardown races with unmount in dev StrictMode; nothing to recover.
  });
}
