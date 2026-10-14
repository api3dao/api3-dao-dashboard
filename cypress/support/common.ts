import { Contract, providers, utils } from 'ethers';
import contracts from '../../src/contract-deployments/localhost-dao.json';

export const ethersProvider = new providers.JsonRpcProvider('http://localhost:8545');

// https://hardhat.org/hardhat-network/#hardhat-network-initial-state
export const ACCOUNTS = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
  '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
  '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
  '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
  '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
  '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
  '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
  '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
];

export const abbrStr = (str: string) => {
  return str.substring(0, 5) + '...' + str.substring(str.length - 4, str.length);
};

export const EPOCH_LENGTH = 7 * 60 * 60 * 24; // in seconds

export const closeErrorReportingNotice = () => {
  cy.dataCy('error-reporting')
    .findByRole('button', { name: /accept all/i })
    .click();
  cy.dataCy('error-reporting').should('not.exist');
};

export const HOME_PAGE = 'http://localhost:3000/#/';

// The dashboard no longer allows deposits and stakes, so tests seed them directly on chain (as the first account)
export const depositAndStake = (depositAmount: string, stakeAmount: string) => {
  cy.wrap(null).then(async () => {
    const signer = ethersProvider.getSigner(0);
    const api3Token = new Contract(contracts.api3Token, ['function approve(address spender, uint256 amount)'], signer);
    const api3Pool = new Contract(
      contracts.api3Pool,
      ['function depositRegular(uint256 amount)', 'function stake(uint256 amount)'],
      signer
    );

    const deposit = utils.parseEther(depositAmount);
    const approveTx = await api3Token.approve(contracts.api3Pool, deposit);
    await approveTx.wait();
    const depositTx = await api3Pool.depositRegular(deposit);
    await depositTx.wait();
    const stakeTx = await api3Pool.stake(utils.parseEther(stakeAmount));
    await stakeTx.wait();
  });
};
