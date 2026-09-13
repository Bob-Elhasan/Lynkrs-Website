import * as THREE from 'three';

/**
 * Everything here is generated on the canvas at runtime. There is no texture
 * pack to fetch, so first paint never waits on a network request and the
 * whole experience stays inside the JS bundle's weight budget.
 */

export type LabelOptions = {
  fontSize?: number;
  color?: string;
  font?: string;
  align?: CanvasTextAlign;
  weight?: string;
  letterSpacing?: number;
};

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return { canvas, ctx };
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number,
  align: CanvasTextAlign,
) {
  if (!letterSpacing) {
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    return;
  }
  ctx.textAlign = 'left';
  const widths = [...text].map((ch) => ctx.measureText(ch).width + letterSpacing);
  const total = widths.reduce((a, b) => a + b, 0) - letterSpacing;
  let cursor = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  [...text].forEach((ch, i) => {
    ctx.fillText(ch, cursor, y);
    cursor += widths[i];
  });
}

/** Renders a single line of label text to a transparent canvas texture. */
export function createLabelTexture(text: string, width: number, height: number, opts: LabelOptions = {}) {
  const { canvas, ctx } = makeCanvas(width, height);
  const {
    fontSize = 48,
    color = '#c8a85c',
    font = 'Georgia, serif',
    align = 'center',
    weight = '400',
    letterSpacing = 0,
  } = opts;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.font = `${weight} ${fontSize}px ${font}`;
  ctx.textBaseline = 'middle';
  const x = align === 'center' ? width / 2 : align === 'right' ? width - 12 : 12;
  drawSpacedText(ctx, text, x, height / 2, letterSpacing, align);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Word-wraps a title + body into a single canvas texture panel (door detail cards). */
export function createPanelTexture(
  title: string,
  body: string,
  width = 1024,
  height = 640,
  accent = '#c8a85c',
) {
  const { canvas, ctx } = makeCanvas(width, height);

  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, width, 6);

  ctx.fillStyle = accent;
  ctx.font = '600 54px Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, 56, 120);

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(56, 150);
  ctx.lineTo(width - 56, 150);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#d8d8d4';
  ctx.font = '400 30px Georgia, serif';
  const maxWidth = width - 112;
  const lineHeight = 42;
  const maxY = height - 40;
  const words = body.split(' ');
  let line = '';
  let y = 210;
  for (const word of words) {
    if (y > maxY) break;
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, 56, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line && y <= maxY) ctx.fillText(line, 56, y);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/** Small procedural brushed-metal variation map: fine directional noise for roughness/normal. */
export function createBrushedNoiseTexture(size = 256, strength = 0.5) {
  const { canvas, ctx } = makeCanvas(size, size);
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const streak = Math.sin(y * 0.9 + Math.sin(x * 0.05) * 3) * 0.5 + 0.5;
      const noise = Math.random() * strength + streak * (1 - strength);
      const v = Math.floor(180 + noise * 60);
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Builds a small procedural "room" scene (soft gradient walls + warm ceiling
 * strip lights) and bakes it into a PMREM env map, so metal surfaces get
 * believable reflections without fetching an external HDRI.
 */
export function createProceduralEnvMap(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');

  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#3a3a3a');
  grad.addColorStop(0.45, '#141414');
  grad.addColorStop(0.55, '#0a0a0a');
  grad.addColorStop(1, '#050505');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size * 2, size);

  // Warm ceiling light streaks, echoed a few times around the equirect.
  ctx.fillStyle = '#fff5e0';
  for (let i = 0; i < 6; i++) {
    const x = (i / 6) * size * 2;
    ctx.globalAlpha = 0.5;
    ctx.fillRect(x, size * 0.08, size * 0.12, size * 0.03);
  }
  ctx.globalAlpha = 1;

  // Gold accent glow band, roughly at handrail height.
  ctx.fillStyle = '#c8a85c';
  ctx.globalAlpha = 0.18;
  ctx.fillRect(0, size * 0.62, size * 2, size * 0.04);
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
