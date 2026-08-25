const { red, bold } = require('chalk');
const exec = require('util').promisify(require('child_process').exec);

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

module.exports = {
  execAndLog,
  promiseWrapper,
};
