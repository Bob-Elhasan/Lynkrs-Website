import * as THREE from 'three';
import { CSS } from './palette';

/**
 * Every map is drawn on a canvas at runtime — there is no texture pack to
 * fetch, so first paint never waits on the network.
 *
 * Crispness comes from three things applied consistently here: generous
 * source resolution, mipmaps with trilinear filtering, and the renderer's
 * max anisotropy on anything viewed at a grazing angle (floors, walls, rugs).
 */

let maxAnisotropy = 8;

/** Called once the renderer exists, so every texture can use its real limit. */
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

function finish(canvas: HTMLCanvasElement, opts: { srgb?: boolean; repeat?: [number, number] } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  if (opts.srgb !== false) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  if (opts.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  texture.needsUpdate = true;
  return texture;
}

// ─── Type ────────────────────────────────────────────────────────────────

export type LabelOptions = {
  fontSize?: number;
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  weight?: string;
  letterSpacing?: number;
  background?: string;
};

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

/** Single line of text on a transparent ground. Rendered at 2x for sharpness. */
export function createLabelTexture(text: string, width: number, height: number, opts: LabelOptions = {}) {
  const scale = 2;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const {
    fontSize = 48,
    color = CSS.ink,
    font = "'Poppins', 'Inter', system-ui, sans-serif",
    align = 'center',
    weight = '500',
    letterSpacing = 0,
    background,
  } = opts;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = color;
  ctx.font = `${weight} ${fontSize * scale}px ${font}`;
  ctx.textBaseline = 'middle';
  const x = align === 'center' ? canvas.width / 2 : align === 'right' ? canvas.width - 20 : 20;
  drawSpaced(ctx, text, x, canvas.height / 2, letterSpacing * scale, align);

  return finish(canvas);
}

/**
 * A brushed-steel plaque with the text cut into it. The "engraving" is a
 * dark inset line offset by a light highlight, which is what actually sells
 * laser-etched metal at a glance.
 */
export function createEngravedPlaque(
  text: string,
  width: number,
  height: number,
  opts: { fontSize?: number; letterSpacing?: number; plate?: string; accent?: string } = {},
) {
  const scale = 2;
  const { canvas, ctx } = makeCanvas(width * scale, height * scale);
  const { fontSize = 56, letterSpacing = 6, plate = CSS.steel, accent } = opts;

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#dfe3e8');
  grad.addColorStop(0.45, plate);
  grad.addColorStop(0.55, '#b4bcc5');
  grad.addColorStop(1, '#d4d9df');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine brush lines across the plate.
  ctx.globalAlpha = 0.12;
  for (let y = 0; y < canvas.height; y += 2) {
    ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#8d959e';
    ctx.fillRect(0, y, canvas.width, 1);
  }
  ctx.globalAlpha = 1;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Shrink to fit rather than overflow the plate: engraving that runs off the
  // edge reads as a bug, and these strings vary a lot in length.
  const maxWidth = canvas.width * 0.88;
  let size = fontSize * scale;
  let spacing = letterSpacing * scale;
  const measure = () => {
    ctx.font = `600 ${size}px 'Poppins', 'Inter', system-ui, sans-serif`;
    return [...text].reduce((w, ch) => w + ctx.measureText(ch).width + spacing, 0) - spacing;
  };
  while (measure() > maxWidth && size > 8) {
    size *= 0.94;
    spacing *= 0.94;
  }

  // Highlight below, shadow above: reads as material removed, not printed.
  ctx.font = `600 ${size}px 'Poppins', 'Inter', system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  drawSpaced(ctx, text, cx, cy + 2 * scale, spacing, 'center');
  ctx.fillStyle = accent ?? 'rgba(24,50,83,0.78)';
  drawSpaced(ctx, text, cx, cy, spacing, 'center');

  return finish(canvas);
}

/** Brushed metal: fine directional streaks used as a roughness map. */
export function createBrushedMetalMap(size = 512) {
  const { canvas, ctx } = makeCanvas(size, size);
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    const band = Math.sin(y * 0.35) * 10;
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const streak = Math.random() * 26 + band;
      const v = Math.max(0, Math.min(255, 118 + streak));
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return finish(canvas, { srgb: false, repeat: [3, 3] });
}

/** Oak-ish grain: warm base, drifting rings, subtle pores. */
export function createWoodTexture(size = 1024, base = '#b1793f', dark = '#7d5327') {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Long grain lines with a slow wander, so they don't read as stripes.
  for (let i = 0; i < 170; i++) {
    const y0 = Math.random() * size;
    const width = Math.random() * 3 + 0.6;
    ctx.strokeStyle = Math.random() > 0.45 ? dark : '#96632f';
    ctx.globalAlpha = Math.random() * 0.35 + 0.08;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    for (let x = 0; x <= size; x += 24) {
      const drift = Math.sin((x + i * 40) * 0.006) * 9 + Math.sin(x * 0.02 + i) * 3;
      ctx.lineTo(x, y0 + drift);
    }
    ctx.stroke();
  }

  // A couple of knots.
  ctx.globalAlpha = 0.3;
  for (let k = 0; k < 2; k++) {
    const kx = Math.random() * size;
    const ky = Math.random() * size;
    for (let r = 26; r > 0; r -= 3) {
      ctx.strokeStyle = r % 6 === 0 ? dark : '#8b5a2b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(kx, ky, r, r * 0.62, 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  return finish(canvas, { repeat: [1, 1] });
}

/** Large-format stone floor: soft veining over a light ground, with grout. */
export function createStoneFloorTexture(size = 1024) {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = '#e6e9ee';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(120,134,152,0.32)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 26; i++) {
    ctx.globalAlpha = Math.random() * 0.5 + 0.15;
    ctx.beginPath();
    let x = Math.random() * size;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < size) {
      x += (Math.random() - 0.5) * 70;
      y += Math.random() * 45 + 18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Tile joints.
  ctx.strokeStyle = 'rgba(150,160,174,0.55)';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(0, 0, size, size);

  return finish(canvas, { repeat: [6, 6] });
}

/** Corridor runner: navy ground, woven noise, brand stripes down the edges. */
export function createRugTexture(width = 256, height = 1024) {
  const { canvas, ctx } = makeCanvas(width, height);
  ctx.fillStyle = '#1d3a5f';
  ctx.fillRect(0, 0, width, height);

  // Weave.
  ctx.globalAlpha = 0.12;
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      ctx.fillStyle = (x + y) % 6 === 0 ? '#2c5183' : '#16304f';
      ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.globalAlpha = 1;

  const stripe = (x: number, w: number, color: string, alpha: number) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, w, height);
    ctx.globalAlpha = 1;
  };
  stripe(18, 6, '#cdcd00', 0.85);
  stripe(width - 24, 6, '#cdcd00', 0.85);
  stripe(34, 3, '#3c76c0', 0.7);
  stripe(width - 37, 3, '#3c76c0', 0.7);

  return finish(canvas, { repeat: [1, 4] });
}

/** Painted wall: near-flat cream with just enough tooth to catch light. */
export function createWallTexture(size = 512) {
  const { canvas, ctx } = makeCanvas(size, size);
  ctx.fillStyle = '#eef0f3';
  ctx.fillRect(0, 0, size, size);
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    image.data[i] += n;
    image.data[i + 1] += n;
    image.data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
  return finish(canvas, { repeat: [4, 4] });
}

/**
 * A wall-mounted content board: heading, rule, body, and an optional
 * kicker. Drawn big (2048px wide) because the camera walks right up to it.
 */
export function createContentBoardTexture(
  kicker: string,
  title: string,
  body: string,
  bullets: string[] = [],
) {
  const width = 2048;
  const height = 1280;
  const { canvas, ctx } = makeCanvas(width, height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = CSS.blue;
  ctx.fillRect(0, 0, width, 14);

  const pad = 128;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = CSS.blue;
  ctx.font = "600 44px 'Poppins', 'Inter', system-ui, sans-serif";
  drawSpaced(ctx, kicker.toUpperCase(), pad, 180, 8, 'left');

  ctx.fillStyle = CSS.ink;
  ctx.font = "600 104px 'Poppins', 'Inter', system-ui, sans-serif";
  let y = 320;
  for (const line of wrap(ctx, title, width - pad * 2)) {
    ctx.fillText(line, pad, y);
    y += 118;
  }

  ctx.strokeStyle = CSS.yellow;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(pad, y - 40);
  ctx.lineTo(pad + 180, y - 40);
  ctx.stroke();

  ctx.fillStyle = '#4a6180';
  ctx.font = "400 48px 'Poppins', 'Inter', system-ui, sans-serif";
  y += 60;
  const maxY = height - 120;
  for (const line of wrap(ctx, body, width - pad * 2)) {
    if (y > maxY) break;
    ctx.fillText(line, pad, y);
    y += 68;
  }

  if (bullets.length) {
    y += 30;
    ctx.font = "500 44px 'Poppins', 'Inter', system-ui, sans-serif";
    for (const item of bullets) {
      if (y > maxY) break;
      ctx.fillStyle = CSS.yellow;
      ctx.fillRect(pad, y - 18, 16, 16);
      ctx.fillStyle = CSS.ink;
      ctx.fillText(item, pad + 44, y);
      y += 66;
    }
  }

  return finish(canvas);
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

/**
 * A bright interior environment: light ceiling, cream walls, darker floor
 * band. Baked once through PMREM so metal picks up believable reflections
 * without an HDRI download.
 */
export function createProceduralEnvMap(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const size = 512;
  const { canvas, ctx } = makeCanvas(size * 2, size);

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.38, '#f2f4f7');
  grad.addColorStop(0.52, '#dfe4ea');
  grad.addColorStop(1, '#b9c0c9');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);

  // Ceiling light bars, which become the highlights running across the steel.
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 8; i++) {
    ctx.globalAlpha = 0.9;
    ctx.fillRect((i / 8) * size * 2, size * 0.05, size * 0.14, size * 0.05);
  }
  // A cool blue bounce near the horizon keeps reflections brand-tinted.
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = '#3c76c0';
  ctx.fillRect(0, size * 0.5, size * 2, size * 0.08);
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
