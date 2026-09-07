import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/** GitHub Pages project site. Overridable so a custom domain can use '/'. */
const BASE = process.env.VITE_BASE ?? '/Lynkrs-Website/';

function manualChunks(id: string) {
  if (!id.includes('node_modules')) return undefined;

  const reactVendor = ['react', 'react-dom', 'react-router', 'react-router-dom'];
  if (reactVendor.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return 'react-vendor';

  // The 3D stack is deliberately NOT grouped into a manual chunk.
  //
  // IWSDK pulls in roughly 6.9MB of three.js addons that only the immersive
  // path needs. Naming a shared "three-vendor" chunk forces those into the
  // bundle every flat-browser visitor downloads — measured at 6.1MB gzipped
  // versus 556kB when Rollup is left to split along the dynamic import
  // boundary instead. So three, @react-three, @pmndrs, @iwsdk and friends all
  // fall through to automatic splitting.
  return undefined;

  const uiVendor = ['radix-ui', '@radix-ui', '@base-ui', 'motion', 'lucide-react', '@hugeicons'];
  if (uiVendor.some((pkg) => id.includes(`/node_modules/${pkg}`))) return 'ui-vendor';

  return undefined;
}

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Lynkrs — Growth is designed, not guessed',
        short_name: 'Lynkrs',
        description:
          'A growth agency. We join strategy, execution and reporting into one system, so marketing earns its keep.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#070d14',
        theme_color: '#0d2c3e',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the shell only. The 3D chunk and its assets are large and
        // most visits never enter the corridor deeply enough to need all of
        // them, so they are cached on demand instead of up front.
        globPatterns: ['**/*.{css,html,svg,ico,woff2}', '**/index-*.js', '**/react-vendor-*.js'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(three-vendor|ui-vendor)-[^/]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lynkrs-3d',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.(?:glb|gltf|ktx2|bin|wasm|png|jpg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lynkrs-assets',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks } },
    chunkSizeWarningLimit: 1600,
  },
  server: { port: 5173, host: true },
});
