import { existsSync } from 'fs';

export const getDeploymentFile = () => {
  const deploymentFileName = `${__dirname}/../../src/contract-deployments/localhost-dao.json`;

  if (!existsSync(deploymentFileName)) {
    throw new Error(`Couldn't find deployment file.`);
  }

  return require(deploymentFileName);
};
