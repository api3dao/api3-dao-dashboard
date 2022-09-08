const hre = require('hardhat');
const { promiseWrapper } = require('../utils');
const { SUB_COURT_ID } = require('../../src/logic/claims');

async function deploy() {
  const accounts = await hre.ethers.getSigners();
  const roles = {
    deployer: accounts[0],
    manager: accounts[1],
  };
  const accessControlRegistryFactory = await hre.ethers.getContractFactory('AccessControlRegistry', roles.deployer);
  const accessControlRegistry = await accessControlRegistryFactory.deploy();
  const mockApi3PoolFactory = await hre.ethers.getContractFactory('MockApi3Pool', roles.deployer);
  const mockApi3Pool = await mockApi3PoolFactory.deploy();
  const mockKlerosArbitratorFactory = await hre.ethers.getContractFactory('MockKlerosLiquid', roles.deployer);
  const mockKlerosArbitrator = await mockKlerosArbitratorFactory.deploy();

  const claimsManagerFactory = await hre.ethers.getContractFactory('ClaimsManager', roles.deployer);
  const adminRoleDescription = 'ClaimsManager admin';
  const claimsManager = await claimsManagerFactory.deploy(
    accessControlRegistry.address,
    adminRoleDescription,
    roles.manager.address,
    mockApi3Pool.address,
    3 * 24 * 60 * 60,
    3 * 24 * 60 * 60,
    30 * 24 * 60 * 60
  );

  const klerosLiquidProxyFactory = await hre.ethers.getContractFactory('KlerosLiquidProxy', roles.deployer);
  const klerosLiquidProxy = await klerosLiquidProxyFactory.deploy(
    claimsManager.address,
    mockKlerosArbitrator.address,
    generateArbitratorExtraData(SUB_COURT_ID, 3),
    '/ipfs/Qm...testhash/metaEvidence.json'
  );

  const tx = await accessControlRegistry.connect(roles.manager).initializeManager(roles.manager.address);
  const receipt = await tx.wait();
  const event = receipt.events.find((ev) => ev.event === 'InitializedManager');
  const { rootRole } = event.args;

  const [adminRole, arbitratorRole] = await Promise.all([claimsManager.adminRole(), claimsManager.arbitratorRole()]);
  await accessControlRegistry.connect(roles.manager).initializeRoleAndGrantToSender(rootRole, adminRoleDescription);
  // NOTE: The role description ("Arbitrator") needs to be in sync with the description given in the ClaimsManager contract
  await accessControlRegistry.connect(roles.manager).initializeRoleAndGrantToSender(adminRole, 'Arbitrator');
  await accessControlRegistry.connect(roles.manager).grantRole(arbitratorRole, klerosLiquidProxy.address);

  const mockDapiServerFactory = await hre.ethers.getContractFactory('MockDapiServer', roles.deployer);
  const mockDapiServer = await mockDapiServerFactory.deploy();
  // Create mock data feed
  const dataFeed = {
    id: hre.ethers.utils.formatBytes32String('API3-USD-feed-01'),
    name: hre.ethers.utils.formatBytes32String('API3/USD'),
    value: hre.ethers.utils.parseEther('0.5'),
    timestamp: Math.round(new Date().getTime() / 1000),
  };
  await mockDapiServer.mockDataFeed(dataFeed.id, dataFeed.value, dataFeed.timestamp);
  await mockDapiServer.mockDapiName(dataFeed.name, dataFeed.id);

  const api3ToUsdReaderFactory = await hre.ethers.getContractFactory('Api3ToUsdReader', roles.deployer);
  const api3ToUsdReader = await api3ToUsdReaderFactory.deploy(mockDapiServer.address, claimsManager.address);
  await claimsManager.connect(roles.manager).setApi3ToUsdReader(api3ToUsdReader.address);

  console.info('DEPLOYED ADDRESSES:');
  console.info(
    JSON.stringify(
      {
        claimsManager: claimsManager.address,
        arbitratorProxy: klerosLiquidProxy.address,
        arbitrator: mockKlerosArbitrator.address,
      },
      null,
      2
    )
  );
}

promiseWrapper(deploy);

// Function provided by Kleros. @see https://kleros.gitbook.io/docs
function generateArbitratorExtraData(subCourtId, noOfVotes) {
  return `0x${
    parseInt(subCourtId, 10).toString(16).padStart(64, '0') + parseInt(noOfVotes, 10).toString(16).padStart(64, '0')
  }`;
}
