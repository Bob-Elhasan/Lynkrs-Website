import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, PointLight } from 'three';

import { damp } from '@/xr/motion';

type HoverLight = {
  color: string;
  baseIntensity: number;
  hoverIntensity: number;
  position?: [number, number, number];
  distance?: number;
};

type InteractiveCardProps = {
  position: [number, number, number];
  onSelect: () => void;
  children: React.ReactNode;
  hoverScale?: number;
  /** An optional built-in point light whose intensity ramps with hover, so
   * the card visibly brightens rather than only scaling. */
  light?: HoverLight;
};

/**
 * A clickable, hover-reactive wrapper for the module and bundle cards.
 *
 * The hover amount is kept in a ref and eased inside `useFrame`, not React
 * state — state only flips a target on pointer enter/leave, and the actual
 * per-frame scale/light ramp reads that ref directly. Passing the eased
 * value out through a render prop instead would only update on the renders
 * that flip the target (twice, at hover start and end); everything that
 * needs the continuous value lives inside this one `useFrame` instead.
 *
 * The OS cursor is set manually — R3F does not touch it for you inside a
 * canvas the way CSS `cursor` does for DOM elements.
 */
export function InteractiveCard({
  position,
  onSelect,
  children,
  hoverScale = 1.06,
  light,
}: InteractiveCardProps) {
  const group = useRef<Group>(null);
  const lightRef = useRef<PointLight>(null);
  const [hoverTarget, setHoverTarget] = useState(0);
  const hovered = useRef(0);

  // The station this card lives in can unmount mid-hover if the visitor
  // scrolls without moving the pointer — the camera moves away but no
  // pointerOut fires, since R3F only re-raycasts on real pointer events.
  // Without this the cursor would stay stuck as a pointer over empty canvas.
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_state, delta) => {
    hovered.current += (hoverTarget - hovered.current) * damp(10, delta);

    if (group.current) {
      group.current.scale.setScalar(1 + (hoverScale - 1) * hovered.current);
    }
    if (light && lightRef.current) {
      lightRef.current.intensity =
        light.baseIntensity + (light.hoverIntensity - light.baseIntensity) * hovered.current;
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHoverTarget(1);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHoverTarget(0);
        document.body.style.cursor = 'auto';
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
      {light ? (
        <pointLight
          ref={lightRef}
          position={light.position ?? [0, 0, 1]}
          color={light.color}
          intensity={light.baseIntensity}
          distance={light.distance ?? 6}
        />
      ) : null}
    </group>
  );
}
