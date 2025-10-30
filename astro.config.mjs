// @ts-check
import { defineConfig } from 'astro/config';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable server-side rendering for OAuth/cookies
  adapter: netlify()
});