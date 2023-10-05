/* eslint-disable @typescript-eslint/no-var-requires */
const exec = require('node:util').promisify(require('node:child_process').exec);

// eslint-disable-next-line unicorn/import-style
const { red, bold } = require('chalk');
const replace = require('replace-in-file');

const promiseWrapper = (fn) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  fn()
    // eslint-disable-next-line unicorn/no-process-exit
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(red(error));
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
};

const execAndLog = async (command, debug = false) => {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.info(bold(`Command: "${command}"`));
  const output = await exec(command);

  const { stdout, stderr } = output;
  if (debug) {
    console.info(`Stdout: ${stdout}`);
    console.info(red(`Stderr: ${stderr}`));
  }

  return output;
};

// NOTE: You can pass {dry: true} to verify that the replace will do what it should
const replaceAndLog = async (options, debug = false) => {
  // Make sure the string has roughly 20 chars
  const trimString = (str) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-call
    return str.length > 20 ? `${str.slice(0, 20)}...` : str;
  };

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.info(bold(`Replacing "${trimString(options.from)}" with "${trimString(options.to)}"`));
  const log = await replace(options);

  if (debug) {
    console.info(`Stdout: ${JSON.stringify(log, null, 2)}`);
  }
};

module.exports = {
  execAndLog,
  promiseWrapper,
  replaceAndLog,
};
