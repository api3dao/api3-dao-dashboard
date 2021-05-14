import '@nomiclabs/hardhat-waffle';
import { ethers } from 'hardhat';
import { getDeploymentFile } from '../../utils';
import { writeFileSync } from 'fs';

async function main() {
  const Api3Pool = getDeploymentFile('localhost', 'Api3Pool');
  const deployerSigner = (await ethers.getSigners())[0];
  const api3Pool = new ethers.Contract(Api3Pool.address, Api3Pool.abi, deployerSigner);

  // Make sure you have this defined. See voting-apps-addresses.example.json
  const apps = require('./voting-apps-addresses.json');

  // Set DAO apps and verify that SetDaoApps event was emitted
  await api3Pool.setDaoApps(apps.agentPrimary, apps.agentSecondary, apps.votingPrimary, apps.votingSecondary);
  const logs = await api3Pool.queryFilter({ address: api3Pool.address });
  if (logs.length !== 1 || logs[0].event !== 'SetDaoApps') {
    throw new Error('Expected single SetDaoApps event to be emitted!');
  }

  // For convenience add the apps addresses to the exported deployment files
  const exportedFilePath = `${__dirname}/../../../src/contract-deployments/localhost-dao.json`;
  const deployData = require(exportedFilePath);
  deployData.contracts.PrimaryAgentAppAddress = apps.agentPrimary;
  deployData.contracts.SecondaryAgentAppAddress = apps.agentSecondary;
  deployData.contracts.PrimaryVotingAppAddress = apps.votingPrimary;
  deployData.contracts.SecondaryVotingAppAddress = apps.votingSecondary;
  writeFileSync(exportedFilePath, JSON.stringify(deployData, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
