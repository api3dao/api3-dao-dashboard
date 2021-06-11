import { encodeEvmScript, encodeMetadata } from '../../src/logic/proposals/encoding';
import localhostDao from '../../src/contract-deployments/localhost-dao.json';
import { lorem, name } from 'faker';
import { ethers } from 'hardhat';

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
const randInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

const chooseOne = <T>(choices: readonly T[]): T => {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
};

async function main() {
  const api3Voting = { primary: localhostDao.votingAppPrimary, secondary: localhostDao.votingAppSecondary };
  const api3Agent = { primary: localhostDao.agentAppPrimary, secondary: localhostDao.agentAppSecondary };
  const votingAbi = [
    'function newVote(bytes _executionScript, string _metadata, bool _castVote, bool _executesIfDecided) external returns (uint256 voteId)',
  ];
  const accounts = await ethers.getSigners();
  let proposalCounter = 1;
  const createNewFormData = (type: 'primary' | 'secondary') => ({
    description: lorem.lines(randInt(3, 15)),
    title: `${proposalCounter++}. ${name.jobTitle()}`, // Easier to read than lorem ipsum
    parameters: JSON.stringify([lorem.word(), randInt(1, 100)]),
    targetSignature: `${lorem.word()}(string,uint256)`,
    targetAddress: chooseOne([
      '0xB97F3A052d5562437e42EDeEBd1afec2376666eD',
      '0xf812b4002bc8822575f1fB720870158238Ca7E72',
      '0x1BC83C4DfcE990A83eEA9e302757f5F91252C864',
      '0x6D7FBA44e3bbEB98CDd5d7B32F5968E26D3Dd119',
    ]),
    targetValue: randInt(1, 15).toString(),
    type,
  });

  for (const account of accounts) {
    const type = chooseOne(['primary', 'secondary'] as const);
    const formData = createNewFormData(type);
    const votingApp = new ethers.Contract(api3Voting[formData.type], votingAbi, account);
    try {
      await votingApp.newVote(encodeEvmScript(formData, api3Agent), encodeMetadata(formData), true, true);
    } catch (e) {
      console.error(`Failed to create proposal for account ${account.address}. (${e.message})`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
