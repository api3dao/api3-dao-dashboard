import { readFileSync, existsSync } from 'node:fs';

import { defineConfig } from 'cypress';

export default defineConfig({
  defaultCommandTimeout: 15_000,

  retries: {
    runMode: 1,
    openMode: 0,
  },

  video: false,

  e2e: {
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        readFileMaybe(filename) {
          if (existsSync(filename)) {
            return readFileSync(filename, 'utf8');
          }

          return null;
        },
      });
    },
  },
});
