const { red, bold } = require('chalk');
const exec = require('util').promisify(require('child_process').exec);
const replace = require('replace-in-file');

const promiseWrapper = (fn) => {
  fn()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(red(error));
      process.exit(1);
    });
};

const execAndLog = async (command, debug = false) => {
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
    if (str.length > 20) return `${str.substring(0, 20)}...`;
    else return str;
  };

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
