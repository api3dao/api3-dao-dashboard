/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import { readFileSync, existsSync } from 'fs';

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: Cypress.PluginEvents, _config: Cypress.PluginConfigOptions) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // https://docs.cypress.io/api/commands/task#Read-a-file-that-might-not-exist
  on('task', {
    readFileMaybe(filename) {
      if (existsSync(filename)) {
        return readFileSync(filename, 'utf8');
      }

      return null;
    },
  });
};
