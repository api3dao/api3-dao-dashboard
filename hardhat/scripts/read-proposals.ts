import '@nomiclabs/hardhat-waffle';
import { ethers } from 'hardhat';
import { getDeploymentFile } from './utils-to-remove';
import { getDeploymentFile as hardhatDeploymentFile } from '../utils';

async function main() {
  const deploymentFile = getDeploymentFile();
  const votingAbi = hardhatDeploymentFile('localhost', 'Api3Voting').abi;

  const signer = (await ethers.getSigners())[0];
  const provider = ethers.provider;
  const api3Voting = new ethers.Contract(deploymentFile.contracts.SecondaryVotingAppAddress, votingAbi, signer);
  const logs = await provider.getLogs({
    address: deploymentFile.contracts.SecondaryVotingAppAddress,
    fromBlock: 0,
    toBlock: 'latest',
  });
  const logs2 = await api3Voting.queryFilter({});
  console.log(logs, logs2);
  // const votingApp = new ethers.Contract('0x0c643e272083f68d78f1eb79b7b8d63a070ca107', votingAbi, provider);
  // const parsedLog = votingApp.interface.parseLog(logs[0]);
  // console.log(logs.length, logs[0].data, parsedLog);
  // const vote = await votingApp.getVote('0');
  // console.log(vote.votingPower.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
