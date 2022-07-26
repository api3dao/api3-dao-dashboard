const hre = require('hardhat');
const { promiseWrapper } = require('../utils');

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
  const mockKlerosArbitratorFactory = await hre.ethers.getContractFactory('MockKlerosArbitrator', roles.deployer);
  const mockKlerosArbitrator = await mockKlerosArbitratorFactory.deploy();

  const claimsManagerWithKlerosArbitrationFactory = await hre.ethers.getContractFactory(
    'ClaimsManagerWithKlerosArbitration',
    roles.deployer
  );
  const claimsManager = await claimsManagerWithKlerosArbitrationFactory.deploy(
    accessControlRegistry.address,
    'ClaimsManager admin',
    roles.manager.address,
    mockApi3Pool.address,
    3 * 24 * 60 * 60,
    3 * 24 * 60 * 60,
    mockKlerosArbitrator.address,
    '0x123456',
    '/ipfs/Qm...testhash/metaEvidence.json',
    40 * 24 * 60 * 60
  );

  const tx = await accessControlRegistry.connect(roles.manager).initializeManager(roles.manager.address);
  const receipt = await tx.wait();
  const event = receipt.events.find((ev) => ev.event === 'InitializedManager');
  const { rootRole } = event.args;

  const [adminRole, arbitratorRole] = await Promise.all([claimsManager.adminRole(), claimsManager.arbitratorRole()]);
  await accessControlRegistry.connect(roles.manager).initializeRoleAndGrantToSender(rootRole, 'ClaimsManager admin');
  await accessControlRegistry.connect(roles.manager).initializeRoleAndGrantToSender(adminRole, 'Arbitrator');
  await accessControlRegistry.connect(roles.manager).grantRole(arbitratorRole, mockKlerosArbitrator.address);

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
    JSON.stringify({ claimsManager: claimsManager.address, arbitrator: mockKlerosArbitrator.address }, null, 2)
  );
}

promiseWrapper(deploy);
