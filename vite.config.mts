// <reference types="vitest/config">
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  // Use relative asset URLs so the app works when served from an IPFS gateway path (previously "homepage": "." in
  // package.json).
  base: './',
  plugins: [
    react(),
    // Some transitive web3 dependencies (WalletConnect, Coinbase wallet SDK, ethers v5) expect Node globals and
    // builtins in the browser (previously webpack "resolve.fallback" and ProvidePlugin in config-overrides.js).
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
    // Force disable source maps to simplify deterministic verification of CID IPFS hash
    sourcemap: false,
    target: browserslistToEsbuild(),
    rollupOptions: {
      output: {
        manualChunks(id) {
          // The "(?<!node_modules.*)" regex ignores nested copies of packages, so that they're bundled with their
          // issuer. See: https://github.com/vercel/next.js/pull/9012
          if (/(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'framework';
          }
          if (/(?<!node_modules.*)[\\/]node_modules[\\/](@ethersproject|bn\.js|aes-js)[\\/]/.test(id)) {
            return 'core-web3';
          }
          // The @web3modal package spawns too many async chunks, so we bundle it (and WalletConnect, which it pulls
          // in) into a single chunk (previously webpack LimitChunkCountPlugin in config-overrides.js).
          if (/[\\/]node_modules[\\/](@web3modal|@walletconnect)[\\/]/.test(id)) {
            return 'web3modal';
          }
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
