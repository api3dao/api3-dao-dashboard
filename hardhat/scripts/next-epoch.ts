import { ethers } from 'hardhat';
import { EPOCH_LENGTH } from '../../src/contracts/helpers';

async function main() {
  await ethers.provider.send('evm_increaseTime', [EPOCH_LENGTH]); // move the time to the next epoch
  console.info(`NOTE: You may need to reset your metamask wallet after the command completes`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
