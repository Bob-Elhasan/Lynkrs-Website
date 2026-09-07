#!/usr/bin/env node
/**
 * Writes the prerendered DOM mirror into every route's index.html.
 *
 * Runs after `vite build` and `vite build --ssr`. For each route it renders the
 * static markup, injects it into the built shell, and writes the file at the
 * path GitHub Pages will serve it from. Deep links then resolve to real files
 * instead of relying on the 404.html rewrite.
 */
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// new URL('../') already resolves to the repo root directory; do not dirname it.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const ssrEntry = join(root, 'dist-ssr', 'prerender-entry.js');

const { render, routes } = await import(pathToFileURL(ssrEntry).href);

const shell = await readFile(join(dist, 'index.html'), 'utf8');

if (!shell.includes('<div id="root"></div>')) {
  throw new Error('Could not find the root mount point in dist/index.html');
}

/**
 * React 19 hoists <title>/<meta>/<link> into <head> in the browser, but
 * renderToStaticMarkup leaves them inline in the body. Crawlers read <head>,
 * so lift them out here — otherwise every page ships identical metadata.
 */
const META_TAG = /<(title|meta|link)\b[^>]*?(?:\/>|>(?:[^<]*<\/\1>)?)/gi;

function extractHead(html) {
  const tags = [];
  const body = html.replace(META_TAG, (match, tag) => {
    // Only hoist document metadata, never a <link> that is real page content.
    if (tag.toLowerCase() === 'link' && !/rel=["'](canonical|icon|alternate)["']/i.test(match)) {
      return match;
    }
    tags.push(match);
    return '';
  });
  return { head: tags.join('\n    '), body };
}

let count = 0;
for (const route of routes) {
  const rendered = render(route);
  const { head, body } = extractHead(rendered);
  const page = shell
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  const target =
    route === '/' ? join(dist, 'index.html') : join(dist, route.replace(/^\//, ''), 'index.html');

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page, 'utf8');
  count += 1;
}

// GitHub Pages serves 404.html for anything unmatched; point it at the SPA so
// unknown deep links still boot the app rather than showing a bare error.
await cp(join(dist, '404', 'index.html'), join(dist, '404.html'));

console.log(`prerendered ${count} routes`);
