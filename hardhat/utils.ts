import { existsSync } from 'fs';

export const getDeploymentFile = (network: string, contract: string) => {
  const deploymentFileName = `${__dirname}/deployments/${network}/${contract}.json`;

  if (!existsSync(deploymentFileName)) {
    throw new Error(`Couldn't find deployment file for network: '${network}' and contract: '${contract}'.`);
  }

  return require(deploymentFileName);
};
