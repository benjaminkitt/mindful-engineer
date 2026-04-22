import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  site: 'https://mindful.engineer',
  integrations: [mdx()],
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
