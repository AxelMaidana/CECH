import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'server',
  adapter: netlify(),
});
