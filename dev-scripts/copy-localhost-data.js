/**
 * For localhost development, we depend on `localhost-dao.json` file which is gitignored because it will change after
 * each redeployment of the DAO contracts. However, we have to make sure it is created when before build the
 * application.
 */
const exec = require('util').promisify(require('child_process').exec);
const chalk = require('chalk');

const main = async () => {
  console.info(chalk.green('Creating localhost-dao.json...'));
  await exec('cd src/contract-deployments && cp localhost-dao.example.json localhost-dao.json');
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red(`Error: ${error}`));
    process.exit(1);
  });
