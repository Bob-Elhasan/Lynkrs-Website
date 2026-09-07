import { useNavigate } from 'react-router-dom';

import { Scene } from '@/xr/scene';
import { Stage } from '@/xr/stage';
import { useJourneyProgress } from '@/xr/use-journey-progress';

/**
 * Connects scroll and routing to the 3D corridor.
 *
 * The DOM mirror is always in the document and always the accessible copy of
 * record, so the stage's fallback is simply nothing: when WebGL is unavailable
 * the page is the mirror, unchanged.
 *
 * `useNavigate()` is called here, not inside Scene or any station. This
 * component is a normal part of the app's React tree (rendered under
 * BrowserRouter), but the flat-path <Canvas> and the XR path's manually
 * created R3F root are not — calling the hook where Router context actually
 * exists and passing the resulting function down as a plain closure means
 * clickable cards work the same in both, instead of throwing the moment a
 * visitor enters the XR path (a second, disconnected reconciler root).
 */
export function JourneyStage() {
  const { target, reducedMotion } = useJourneyProgress();
  const navigate = useNavigate();

  return (
    <Stage fallback={null}>
      <Scene target={target} reducedMotion={reducedMotion} navigate={navigate} />
    </Stage>
  );
}
