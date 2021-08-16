/**
 * For localhost development, we depend on `localhost-dao.json` file which is gitignored because it will change after
 * each redeployment of the DAO contracts. However, we have to make sure it is created when before build the
 * application.
 */
const { promiseWrapper, execAndLog } = require('./utils');

const main = async () => {
  await execAndLog('cd src/contract-deployments && cp localhost-dao.example.json localhost-dao.json');
};

promiseWrapper(main);
