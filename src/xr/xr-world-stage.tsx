import { useEffect, useRef } from 'react';
import { createRoot, type ReconcilerRoot } from '@react-three/fiber';

import { setStageActive } from '@/xr/stage-state';

/**
 * The immersive path: an IWSDK world hosting the same React scene.
 *
 * This module is the only place @iwsdk/core is imported, and it is reached
 * exclusively through a lazy import triggered by the visitor asking for VR.
 * That keeps its 5.5MB out of the flat-browser bundle entirely.
 *
 * IWSDK creates and owns the renderer, scene, camera, XR session and render
 * loop. React Three Fiber is attached to those same objects with
 * `frameloop: 'never'` so it reconciles the scene graph but never renders —
 * two loops on one context would double-render every frame.
 */
export function XrWorldStage({
  children,
  onFail,
}: {
  children: React.ReactNode;
  onFail: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    void (async () => {
      try {
        const { createWorld, destroyWorld } = await import('@/xr/world');
        destroy = destroyWorld;

        const world = await createWorld(container);
        if (cancelled) return;

        const root = createRoot(world.renderer.domElement as HTMLCanvasElement);
        rootRef.current = root;

        await root.configure({
          gl: world.renderer,
          scene: world.scene,
          camera: world.camera,
          frameloop: 'never',
        });

        if (cancelled) return;
        root.render(children);
        setStageActive(true);
        world.launchXR();
      } catch (error) {
        console.error('[lynkrs] immersive session failed, falling back to flat', error);
        if (!cancelled) onFail();
      }
    })();

    return () => {
      cancelled = true;
      rootRef.current?.unmount();
      rootRef.current = null;
      destroy?.();
    };
    // Scene updates are pushed through the effect below rather than remounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rootRef.current?.render(children);
  }, [children]);

  return <div ref={containerRef} className="pointer-events-auto fixed inset-0 z-0" aria-hidden="true" />;
}
