/**
 * Hacky script which makes sure the TimelockManager.sol can be compiled by hardhat
 */
const replace = require('replace-in-file');

const performReplace = (from, to) => {
  const options = {
    files: './node_modules/api3-dao/packages/pool/contracts/auxiliary/TimelockManager.sol',
    from,
    to,
    dry: false
  };

  return replace(options)
}

const main = async () => {
  try {
    // NOTE: The original contract imports v0.6.12, but that version is replaced using another replace script to 0.8.4
    console.info(await performReplace('../interfaces/v0.8.4/IApi3Pool.sol', '../api3-pool-interface-symlink/IApi3Pool.sol'))
    console.info(await performReplace('@openzeppelin/contracts/math/SafeMath.sol', '@openzeppelin/contracts/utils/math/SafeMath.sol'))
    console.info(await performReplace(/now/g, 'block.timestamp'))
  }
  catch (error) {
    console.error('Error occurred:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
