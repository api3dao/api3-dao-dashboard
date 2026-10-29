import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  // Use relative asset URLs so the app works when served from an IPFS gateway path.
  base: './',
  plugins: [
    react(),
    // Some web3 dependencies expect Node globals and builtins in the browser.
    nodePolyfills({
      include: ['buffer', 'events', 'http', 'https', 'os', 'process', 'stream', 'util'],
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  // The CI e2e tests run against the production build, so we use the same port as the dev server
  // to keep things simple.
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  css: {
    postcss: {
      plugins: [autoprefixer()],
    },
    preprocessorOptions: {
      scss: {
        // The styles use the legacy sass @import rule throughout. Migrating to @use is out of scope for the Vite
        // migration, so silence the deprecation warnings for now.
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    outDir: 'build',
    // Disable source maps to simplify deterministic verification of CID IPFS hash
    sourcemap: false,
    target: browserslistToEsbuild(),
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            },
            {
              name: 'core-web3',
              test: /[\\/]node_modules[\\/](@ethersproject|bn\.js|aes-js)[\\/]/,
            },
            // The @web3modal package spawns too many async chunks, so we bundle it (and WalletConnect, which it pulls
            // in) into a single chunk (previously webpack LimitChunkCountPlugin in config-overrides.js).
            {
              name: 'web3modal',
              test: /[\\/]node_modules[\\/](@web3modal|@walletconnect)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
