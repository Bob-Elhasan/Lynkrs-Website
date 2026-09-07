/**
 * Device capability detection and quality tiers.
 *
 * The site renders to WebGL, so two things must be decided before anything
 * mounts: can this device run it at all, and if so how hard should we push it.
 * Getting the first one wrong shows the visitor a blank canvas.
 */

export type QualityTier = 'high' | 'medium' | 'low';

export type Capability =
  | { supported: true; tier: QualityTier; reason?: undefined }
  | { supported: false; tier: 'low'; reason: string };

/**
 * Probes for WebGL2 with a throwaway canvas.
 *
 * Wrapped in try/catch because context creation throws outright in some
 * hardened and headless environments rather than returning null.
 */
function probeWebGL2(): { ok: boolean; renderer?: string; reason?: string } {
  if (typeof document === 'undefined') {
    return { ok: false, reason: 'no-document' };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: false,
    });
    if (!gl) return { ok: false, reason: 'webgl2-unavailable' };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
      : undefined;

    // Release the probe context immediately; browsers cap how many exist.
    gl.getExtension('WEBGL_lose_context')?.loseContext();

    return { ok: true, renderer };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : 'webgl2-threw',
    };
  }
}

export function detectCapability(): Capability {
  const probe = probeWebGL2();
  if (!probe.ok) {
    return { supported: false, tier: 'low', reason: probe.reason ?? 'unknown' };
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse =
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  // Software renderers report themselves; they will not hold a frame budget.
  const software = /swiftshader|llvmpipe|software/i.test(probe.renderer ?? '');
  if (software) return { supported: true, tier: 'low' };

  if (cores <= 4 || memory <= 4) return { supported: true, tier: 'low' };
  if (coarse || cores <= 8) return { supported: true, tier: 'medium' };
  return { supported: true, tier: 'high' };
}

/** Per-tier budget the scenes read instead of hard-coding numbers. */
export const TIER_BUDGET = {
  high: { dpr: [1, 2] as [number, number], shadows: true, particles: 1400, segments: 64 },
  medium: { dpr: [1, 1.5] as [number, number], shadows: false, particles: 600, segments: 32 },
  low: { dpr: [1, 1] as [number, number], shadows: false, particles: 200, segments: 16 },
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
