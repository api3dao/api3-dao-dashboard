import { defineConfig } from 'cypress';
import { readFileSync, existsSync } from 'fs';

export default defineConfig({
  defaultCommandTimeout: 10000,

  retries: {
    runMode: 1,
    openMode: 0,
  },

  video: true,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
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
