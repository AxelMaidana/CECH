import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: netlify(),
  vite: {
    envPrefix: 'TINYMCE_' // Añade el prefijo para que `import.meta.env.TINYMCE_API_KEY` funcione
  },
});
