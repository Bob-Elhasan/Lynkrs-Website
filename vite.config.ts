import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Split the heavy third-party code into stable chunks so a copy tweak on the
 * marketing pages does not force visitors to re-download the whole bundle.
 */
function manualChunks(id: string) {
  if (!id.includes('node_modules')) return undefined;

  const reactVendor = ['react', 'react-dom', 'react-router', 'react-router-dom'];
  if (reactVendor.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return 'react-vendor';

  const uiVendor = ['radix-ui', '@radix-ui', '@base-ui', 'motion', 'lucide-react', '@hugeicons', 'clsx', 'tailwind-merge', 'next-themes', 'date-fns'];
  if (uiVendor.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return 'ui-vendor';

  const chartVendor = ['recharts', 'd3-', 'victory-vendor'];
  if (chartVendor.some((pkg) => id.includes(`/node_modules/${pkg}`))) return 'chart-vendor';

  return undefined;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks } },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
  },
});
