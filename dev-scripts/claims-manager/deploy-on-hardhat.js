const hre = require('hardhat');
const { promiseWrapper } = require('../utils');

async function deploy() {
  const accounts = await hre.ethers.getSigners();
  const roles = {
    deployer: accounts[0],
    manager: accounts[1],
    kleros: accounts[2],
  };
  const accessControlRegistryFactory = await hre.ethers.getContractFactory('AccessControlRegistry', roles.deployer);
  const accessControlRegistry = await accessControlRegistryFactory.deploy();
  const mockApi3PoolFactory = await hre.ethers.getContractFactory('MockApi3Pool', roles.deployer);
  const mockApi3Pool = await mockApi3PoolFactory.deploy();

  const claimsManagerWithKlerosArbitratorFactory = await hre.ethers.getContractFactory(
    'ClaimsManagerWithKlerosArbitration',
    roles.deployer
  );
  const claimsManager = await claimsManagerWithKlerosArbitratorFactory.deploy(
    accessControlRegistry.address,
    'ClaimsManager admin',
    roles.manager.address,
    mockApi3Pool.address,
    3 * 24 * 60 * 60,
    3 * 24 * 60 * 60,
    roles.kleros.address,
    '0x123456',
    '/ipfs/Qm...testhash/metaEvidence.json',
    40 * 24 * 60 * 60
  );

  console.info('DEPLOYED ADDRESSES:');
  console.info(JSON.stringify({ claimsManager: claimsManager.address }, null, 2));
}

promiseWrapper(deploy);
