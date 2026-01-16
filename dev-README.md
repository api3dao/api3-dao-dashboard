# Development instructions

The DAO dashboard README is reserved for tech savvy users who want to learn more about how is the DAO dashboard
implemented and its security. All developer oriented instructions can be found here.

## Running with hardhat

1. `yarn` - to install dependencies and generate TypeScript types
2. `yarn eth:node` - to start hardhat network
3. `yarn eth:prepare-dao-contracts-for-hardhat` - to download the DAO contract sources locally. You need to run this
   only when running for the first time. The installation of contract dependencies is fragile, it's recommended to use
   node@16.
4. (Optional) Modify the pool contract `EPOCH_LENGTH` variable from `1 weeks` to `1 minutes` to speed up testing. You
   can find this constant inside `dao-contracts/packages/pool/contracts/StateUtils.sol`
5. `yarn eth:deploy-dao-contracts-on-hardhat` - to deploy the contracts locally
6. Copy the `.env.example` to `.env`. Make sure that `REACT_APP_NODE_ENV` is set to `development`
7. `yarn start` - to start the application on localhost on port 3000
8. `yarn send-to-account <address> --ether 5 --tokens 100` to send some ETH and tokens to your account

<!-- markdown-link-check-disable -->
<!-- The "how to reset account link does work, but the github actions check says it returns 403" -->

> MetaMask doesn't handle localhost development ideally. Particularly, that the chain is reset after on every
> `yarn eth:node` command. In case you have problems making a transaction, try to
> [reset the account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

<!-- markdown-link-check-enable -->

## Supported networks

Currently, only `hardhat` and `mainnet` networks are supported. If you want to test the application on a different
network, adapt the configuration to your needs.

## Hosting

We use [Pinata](https://pinata.cloud/) to deploy the application on IPFS.

Currently, there are no preview builds.

### Updating the production deployment

All you need to do is push the code to the `production` branch. The simplest way is to open a PR from the `main` branch
and merge. Afterwards, proceed to create a manual IPFS deployment. Full process:

1. Open a PR from `main` to `production`, wait for CI to pass and merge
2. Run `git checkout production` to check out the production branch locally
3. Run `git pull` to pull the latest changes
4. Populate `.env.production.local` with production secrets
5. Make sure to use Node version 18
6. Run `yarn` to install the latest dependencies
7. Run `yarn build` to create the production build
8. Switch the Node version to at least 22
9. Run `PINATA_JWT=<JWT> yarn upload-build-to-pinata` to upload the build folder to Pinata
10. Run `docker run --rm -v "$(pwd)/build:/build" ipfs/kubo add --only-hash --recursive /build` to verify the CID hash
    of the build folder with the deployed hash on Pinata
11. Verify the uploaded page by clicking on the uploaded "build" row on the UI (differentiated by CID if there are
    multiple) and make sure it loads - the fonts may look strange, but that's only because of security policies defined
    by the Pinata preview site and they will work without issues when used via ENS
12. Refer to the "Updating the name servers" section below to update the ENS name

#### Updating the name servers

The primary way to access the DAO dashboard is through the `api3.eth` ENS name, which points directly to the IPFS hash.
Then, the user can either use `https://api3.eth.limo` or connect to mainnet on their MetaMask (or use a browser which
supports resolving .eth domains) and visit `api3.eth/`.

After pushing to the production branch, [verify the Fleek build](./README.md#verifying-the-fleek-build). Then,
[point `api3.eth` to the new CID](https://docs.ipfs.io/how-to/websites-on-ipfs/link-a-domain/#ethereum-naming-service-ens).
