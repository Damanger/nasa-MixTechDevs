// @ts-check
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwind()],
    optimizeDeps: {
      // Avoid stale 'Outdated Optimize Dep' during dev by forcing re-bundle
      force: true,
    },
    server: {
      host: true,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  },
});
