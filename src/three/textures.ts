import * as THREE from 'three';
import type { Theme } from './theme';

/**
 * Canvas-drawn text only. Every material surface now comes from the vendored
 * CC0 PBR sets in assets.ts — this file is just signage, plaques and slides.
 *
 * Everything drawn here takes a Theme, so text flips ink/paper with the light
 * switch rather than becoming unreadable in one mode.
 */

let maxAnisotropy = 8;

export function setTextureQuality(renderer: THREE.WebGLRenderer) {
  maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return { canvas, ctx };
}

function finish(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const FONT = "'Poppins', 'Inter', system-ui, sans-serif";

function drawSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: CanvasTextAlign,
) {
  if (!spacing) {
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    return;
  }
  ctx.textAlign = 'left';
  const widths = [...text].map((ch) => ctx.measureText(ch).width + spacing);
  const total = widths.reduce((a, b) => a + b, 0) - spacing;
  let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i];
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type LabelOptions = {
  fontSize?: number;
  color?: string;
  align?: CanvasTextAlign;
  weight?: string;
  letterSpacing?: number;
};

export function createLabelTexture(text: string, width: number, height: number, opts: LabelOptions = {}) {
  const scale = 2;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const { fontSize = 48, color = '#1b2a3d', align = 'center', weight = '500', letterSpacing = 0 } = opts;

  ctx.fillStyle = color;
  ctx.font = `${weight} ${fontSize * scale}px ${FONT}`;
  ctx.textBaseline = 'middle';
  const x = align === 'center' ? canvas.width / 2 : align === 'right' ? canvas.width - 20 : 20;
  drawSpaced(ctx, text, x, canvas.height / 2, letterSpacing * scale, align);

  return finish(canvas);
}

/**
 * Engraved plaque, drawn as an alpha-only cut so it sits on top of the real
 * steel material rather than replacing it with a painted-on plate. That is
 * what stops plaques reading as stickers.
 */
export function createEngravedAlpha(
  text: string,
  width: number,
  height: number,
  opts: { fontSize?: number; letterSpacing?: number; theme?: Theme } = {},
) {
  const scale = 2;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const { fontSize = 44, letterSpacing = 5, theme } = opts;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxWidth = canvas.width * 0.88;
  let size = fontSize * scale;
  let spacing = letterSpacing * scale;
  const measure = () => {
    ctx.font = `600 ${size}px ${FONT}`;
    return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, 0) - spacing;
  };
  while (measure() > maxWidth && size > 8) {
    size *= 0.94;
    spacing *= 0.94;
  }

  ctx.font = `600 ${size}px ${FONT}`;
  ctx.textBaseline = 'middle';
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Shadow above, highlight below: material removed, not printed on.
  ctx.fillStyle = theme?.name === 'dark' ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.75)';
  drawSpaced(ctx, text, cx, cy + 2 * scale, spacing, 'center');
  ctx.fillStyle = theme?.name === 'dark' ? 'rgba(6,10,16,0.8)' : 'rgba(20,30,44,0.72)';
  drawSpaced(ctx, text, cx, cy, spacing, 'center');

  return finish(canvas);
}

export type Slide = {
  kicker: string;
  title: string;
  body?: string;
  bullets?: string[];
  /** Rendered large and centred, for the closing slide of a room. */
  statement?: string;
};

/**
 * One projector slide. Drawn on black with light-coloured ink, because it is
 * composited additively as projected light rather than lit as a surface.
 */
export function createSlideTexture(slide: Slide, theme: Theme, index: number, total: number) {
  const width = 1440;
  const height = 810;
  const { canvas, ctx } = makeCanvas(width, height);

  // Black ground: additive blending drops it out, leaving only the light.
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const pad = 106;
  ctx.textBaseline = 'alphabetic';

  if (slide.statement) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 84px ${FONT}`;
    ctx.textAlign = 'center';
    const lines = wrap(ctx, slide.statement, width - pad * 2);
    let y = height / 2 - ((lines.length - 1) * 98) / 2;
    for (const line of lines) {
      ctx.fillText(line, width / 2, y);
      y += 98;
    }
    ctx.fillStyle = theme.highlight;
    ctx.fillRect(width / 2 - 49, y + 21, 98, 6);
    return finish(canvas);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = theme.accent;
  ctx.font = `600 31px ${FONT}`;
  drawSpaced(ctx, slide.kicker.toUpperCase(), pad, 134, 6, 'left');

  ctx.fillStyle = '#ffffff';
  ctx.font = `600 76px ${FONT}`;
  let y = 239;
  for (const line of wrap(ctx, slide.title, width - pad * 2)) {
    ctx.fillText(line, pad, y);
    y += 86;
  }

  ctx.fillStyle = theme.highlight;
  ctx.fillRect(pad, y - 30, 106, 5);
  y += 35;

  if (slide.body) {
    ctx.fillStyle = '#c9d4e2';
    ctx.font = `400 37px ${FONT}`;
    for (const line of wrap(ctx, slide.body, width - pad * 2)) {
      if (y > height - 134) break;
      ctx.fillText(line, pad, y);
      y += 52;
    }
    y += 17;
  }

  if (slide.bullets?.length) {
    ctx.font = `500 34px ${FONT}`;
    for (const item of slide.bullets) {
      if (y > height - 106) break;
      ctx.fillStyle = theme.highlight;
      ctx.fillRect(pad, y - 14, 10, 10);
      ctx.fillStyle = '#eaf0f7';
      ctx.fillText(item, pad + 31, y);
      y += 49;
    }
  }

  // Slide counter, bottom right.
  ctx.fillStyle = '#6d8098';
  ctx.font = `500 27px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${index + 1} / ${total}`, width - pad, height - 63);

  return finish(canvas);
}

/**
 * The environment the metal reflects. Built from the theme so dark mode gets a
 * dim room with bright strip lights rather than a bright one.
 */
export function createProceduralEnvMap(renderer: THREE.WebGLRenderer, theme: Theme) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const size = 512;
  const { canvas, ctx } = makeCanvas(size * 2, size);
  const dark = theme.name === 'dark';

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  if (dark) {
    grad.addColorStop(0, '#2b323c');
    grad.addColorStop(0.4, '#1c222a');
    grad.addColorStop(0.55, '#12161c');
    grad.addColorStop(1, '#0b0e12');
  } else {
    grad.addColorStop(0, '#f4f6f9');
    grad.addColorStop(0.38, '#dfe4ea');
    grad.addColorStop(0.55, '#c2c9d2');
    grad.addColorStop(1, '#9aa2ad');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);

  // Ceiling strips become the highlights that travel across the steel.
  ctx.fillStyle = dark ? '#ffe3bb' : '#f2f5f8';
  for (let i = 0; i < 8; i++) {
    ctx.globalAlpha = dark ? 0.7 : 0.5;
    ctx.fillRect((i / 8) * size * 2 + size * 0.07, size * 0.07, size * 0.07, size * 0.022);
  }
  ctx.globalAlpha = 1;

  const equirect = new THREE.CanvasTexture(canvas);
  equirect.mapping = THREE.EquirectangularReflectionMapping;
  equirect.colorSpace = THREE.SRGBColorSpace;
  equirect.needsUpdate = true;

  const rt = pmrem.fromEquirectangular(equirect);
  equirect.dispose();
  pmrem.dispose();
  return rt.texture;
}
