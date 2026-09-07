import { Scene } from '@/xr/scene';
import { Stage } from '@/xr/stage';
import { useJourneyProgress } from '@/xr/use-journey-progress';

/**
 * Connects scroll and routing to the 3D corridor.
 *
 * The DOM mirror is always in the document and always the accessible copy of
 * record, so the stage's fallback is simply nothing: when WebGL is unavailable
 * the page is the mirror, unchanged.
 */
export function JourneyStage() {
  const { target, reducedMotion } = useJourneyProgress();

  return (
    <Stage fallback={null}>
      <Scene target={target} reducedMotion={reducedMotion} />
    </Stage>
  );
}
