import { lazy, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';

import { detectCapability, TIER_BUDGET, type Capability } from '@/xr/quality';
import { setStageActive } from '@/xr/stage-state';

/**
 * The 3D stage, in two modes.
 *
 * FLAT (default) renders the corridor through React Three Fiber's own
 * renderer. This is what every browser visitor gets, and it is a fully
 * canvas-rendered 3D site.
 *
 * XR loads @iwsdk/core on demand and re-hosts the identical scene inside an
 * IWSDK world, which brings the WebXR session, locomotion and XR input.
 *
 * The split exists for one measured reason: the @iwsdk/core barrel re-exports
 * every subsystem it ships — Havok physics, scene understanding, depth
 * sensing, MCP tooling, the UIKitML parser — and they self-register, so none
 * of it tree-shakes. Measured on this scene it is 6.1MB gzipped against
 * 556kB without it. Charging every visitor 5.5MB for physics a scroll journey
 * never calls is not a trade worth making, so the headset path pays for the
 * headset features and the flat path stays fast.
 */

const XrWorldStage = lazy(() =>
  import('@/xr/xr-world-stage').then((m) => ({ default: m.XrWorldStage })),
);

type StageProps = {
  children: React.ReactNode;
  /** Rendered instead of the canvas when the device cannot run WebGL2. */
  fallback: React.ReactNode;
};

export function Stage({ children, fallback }: StageProps) {
  const [capability] = useState<Capability>(() => detectCapability());
  const [mode, setMode] = useState<'flat' | 'xr'>('flat');
  const [xrAvailable, setXrAvailable] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!capability.supported) return;
    setStageActive(true);
    return () => setStageActive(false);
  }, [capability]);

  // Only offer the immersive path where a headset can actually take it.
  useEffect(() => {
    let cancelled = false;
    const xr = (navigator as { xr?: XRSystem }).xr;
    if (!xr?.isSessionSupported) return;
    void xr
      .isSessionSupported('immersive-vr')
      .then((ok) => !cancelled && setXrAvailable(ok))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!capability.supported || failed) return <>{fallback}</>;

  const budget = TIER_BUDGET[capability.tier];

  if (mode === 'xr') {
    return (
      <Suspense fallback={null}>
        <XrWorldStage onFail={() => setMode('flat')}>{children}</XrWorldStage>
      </Suspense>
    );
  }

  return (
    <>
      <div className="pointer-events-auto fixed inset-0 z-0" aria-hidden="true" data-stage={capability.tier}>
        <Canvas
          dpr={budget.dpr}
          shadows={budget.shadows}
          gl={{ antialias: capability.tier !== 'low', powerPreference: 'high-performance' }}
          camera={{ fov: 50, near: 0.1, far: 600, position: [0, 0, 6] }}
          onCreated={() => setStageActive(true)}
          fallback={null}
          onError={() => setFailed(true)}
        >
          {children}
        </Canvas>
      </div>

      {xrAvailable ? (
        <button
          type="button"
          onClick={() => setMode('xr')}
          className="border-brand/50 bg-brand/15 text-foreground hover:bg-brand/25 pointer-events-auto fixed right-5 bottom-5 z-40 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur"
        >
          Enter in VR
        </button>
      ) : null}
    </>
  );
}
