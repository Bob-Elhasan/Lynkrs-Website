import { useMemo } from 'react';
import { Text } from '@react-three/drei';

import { PALETTE } from '@/xr/palette';

/**
 * 3D typography, rendered into the WebGL canvas with troika SDF text.
 *
 * We author layout explicitly rather than running a flexbox engine in 3D:
 * @react-three/uikit would have given us flex, but it is built against the
 * React Three Fiber v8 reconciler and throws on v9 (which React 19 requires),
 * so drei's Text is the compatible path. Fonts are self-hosted TTFs because
 * troika cannot parse woff2 — and self-hosting keeps the PWA working offline.
 *
 * A Stack lays its children out top-down using each block's declared height,
 * which keeps panels predictable without measuring text asynchronously.
 */

/*
 * Static single-weight Archivo instances, self-hosted.
 *
 * Troika cannot parse woff2, so these are TTF. They are the *static* cuts
 * rather than the variable files: 110kB + 112kB against 658kB + 876kB for
 * variable Archivo and Inter. Archivo carries the canvas alone — the DOM
 * mirror still uses the full Inter/Archivo/Caveat woff2 set, which is where
 * body copy is actually read.
 */
const FONT_DISPLAY = `${import.meta.env.BASE_URL}fonts/archivo-600.ttf`;
const FONT_BODY = `${import.meta.env.BASE_URL}fonts/archivo-400.ttf`;

/**
 * World-unit type scale.
 *
 * The camera sits roughly 14 units back from each station's content. With a
 * 50-degree vertical FOV that makes the visible frame about 13 world units
 * tall, so a 0.17-unit glyph lands at ~12px on a 900px viewport — unreadable.
 * These sizes are set for that viewing distance; change the station spacing in
 * spline.ts and they need revisiting.
 */
export const SIZE = {
  eyebrow: 0.24,
  headline: 0.62,
  headlineLarge: 1.05,
  body: 0.3,
  stamp: 0.4,
  itemNumber: 0.22,
  itemTitle: 0.32,
  itemBody: 0.26,
} as const;

/** Default wrap width in world units. */
const WIDTH = 8.2;

/** Rough line count for a string at a given wrap width, in world units. */
function estimateLines(text: string, fontSize: number, maxWidth: number): number {
  // ~0.52em average advance for these faces; good enough for layout spacing.
  const perLine = Math.max(1, Math.floor(maxWidth / (fontSize * 0.52)));
  return Math.max(1, Math.ceil(text.length / perLine));
}

type Block = { node: React.ReactNode; height: number };

/** Stacks blocks downward from y=0, with a consistent gap. */
export function Stack({ blocks, gap = 0.28 }: { blocks: Block[]; gap?: number }) {
  // Offsets are computed up front rather than accumulated inside the map:
  // reassigning a captured variable mid-render is exactly what the React
  // Compiler cannot reason about, and it trips react-hooks/immutability.
  const offsets = blocks.reduce<number[]>((acc, _block, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] - blocks[i - 1].height - gap);
    return acc;
  }, []);

  return (
    <group>
      {blocks.map((block, i) => (
        <group key={i} position={[0, offsets[i], 0]}>
          {block.node}
        </group>
      ))}
    </group>
  );
}

export function eyebrow(text: string, width = WIDTH): Block {
  return {
    height: SIZE.eyebrow * 1.2,
    node: (
      <Text
        font={FONT_BODY}
        fontSize={SIZE.eyebrow}
        letterSpacing={0.18}
        color={PALETTE.gold}
        anchorX="left"
        anchorY="top"
        maxWidth={width}
      >
        {text.toUpperCase()}
      </Text>
    ),
  };
}

export function headline(
  text: string,
  size: number = SIZE.headline,
  width: number = WIDTH,
): Block {
  const lines = estimateLines(text, size, width);
  return {
    height: lines * size * 1.12,
    node: (
      <Text
        font={FONT_DISPLAY}
        fontSize={size}
        lineHeight={1.12}
        color={PALETTE.offWhite}
        anchorX="left"
        anchorY="top"
        maxWidth={width}
      >
        {text}
      </Text>
    ),
  };
}

export function body(text: string, width = WIDTH, dim = false): Block {
  const size = SIZE.body;
  const lines = estimateLines(text, size, width);
  return {
    height: lines * size * 1.5,
    node: (
      <Text
        font={FONT_BODY}
        fontSize={size}
        lineHeight={1.5}
        color={dim ? '#9fb0c2' : PALETTE.offWhite}
        anchorX="left"
        anchorY="top"
        maxWidth={width}
      >
        {text}
      </Text>
    ),
  };
}

export function stamp(text: string, width = WIDTH): Block {
  const size = SIZE.stamp;
  const lines = estimateLines(text, size, width);
  return {
    height: lines * size * 1.3,
    node: (
      <Text
        font={FONT_DISPLAY}
        fontSize={size}
        lineHeight={1.3}
        color={PALETTE.blueBright}
        anchorX="left"
        anchorY="top"
        maxWidth={width}
      >
        {text}
      </Text>
    ),
  };
}

/** The 01/02/03 device: a small blue index beside a title and optional body. */
export function numbered(
  number: string,
  title: string,
  text?: string,
  width = WIDTH,
): Block {
  const indent = 0.78;
  const titleLines = estimateLines(title, SIZE.itemTitle, width - indent);
  const bodyLines = text ? estimateLines(text, SIZE.itemBody, width - indent) : 0;
  return {
    height:
      titleLines * SIZE.itemTitle * 1.25 +
      bodyLines * SIZE.itemBody * 1.5 +
      (text ? 0.14 : 0),
    node: (
      <group>
        <Text
          font={FONT_BODY}
          fontSize={SIZE.itemNumber}
          color={PALETTE.blueBright}
          anchorX="left"
          anchorY="top"
        >
          {number}
        </Text>
        <group position={[indent, 0, 0]}>
          <Text
            font={FONT_BODY}
            fontSize={SIZE.itemTitle}
            lineHeight={1.25}
            color={PALETTE.offWhite}
            anchorX="left"
            anchorY="top"
            maxWidth={width - indent}
          >
            {title}
          </Text>
          {text ? (
            <Text
              font={FONT_BODY}
              fontSize={SIZE.itemBody}
              lineHeight={1.5}
              color="#9fb0c2"
              anchorX="left"
              anchorY="top"
              maxWidth={width - indent}
              position={[0, -titleLines * SIZE.itemTitle * 1.3, 0]}
            >
              {text}
            </Text>
          ) : null}
        </group>
      </group>
    ),
  };
}

/** Optional backing plane so dense panels stay readable over the starfield. */
export function Surface({
  width,
  height,
  padding = 0.34,
}: {
  width: number;
  height: number;
  padding?: number;
}) {
  const geometry = useMemo<[number, number]>(
    () => [width + padding * 2, height + padding * 2],
    [width, height, padding],
  );
  return (
    <mesh position={[width / 2 - padding / 2, -height / 2 + padding / 2, -0.05]}>
      <planeGeometry args={geometry} />
      <meshBasicMaterial color={PALETTE.navy} transparent opacity={0.68} />
    </mesh>
  );
}
