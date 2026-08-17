# Development instructions

The DAO dashboard README is reserved for tech savvy users who want to learn more about how is the DAO dashboard
implemented and its security. All developer oriented instructions can be found here.

## Running with hardhat

1. `pnpm install` - to install dependencies and generate TypeScript types
2. `pnpm eth:node` - to start hardhat network
3. `pnpm eth:prepare-dao-contracts-for-hardhat` - to download the DAO contract sources locally. You need to run this
   only when running for the first time. The installation of contract dependencies is fragile, it's recommended to use
   node@16.
4. (Optional) Modify the pool contract `EPOCH_LENGTH` variable from `1 weeks` to `1 minutes` to speed up testing. You
   can find this constant inside `dao-contracts/packages/pool/contracts/StateUtils.sol`
5. `pnpm eth:deploy-dao-contracts-on-hardhat` - to deploy the contracts locally
6. Copy the `.env.example` to `.env`. Make sure that `REACT_APP_NODE_ENV` is set to `development`
7. `pnpm start` - to start the application on localhost on port 3000
8. `pnpm send-to-account <address> --ether 5 --tokens 100` to send some ETH and tokens to your account

<!-- markdown-link-check-disable -->
<!-- The "how to reset account link does work, but the github actions check says it returns 403" -->

> MetaMask doesn't handle localhost development ideally. Particularly, that the chain is reset after on every
> `pnpm eth:node` command. In case you have problems making a transaction, try to
> [reset the account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

<!-- markdown-link-check-enable -->

## Supported networks

Currently, only `hardhat` and `mainnet` networks are supported. If you want to test the application on a different
network, adapt the configuration to your needs.

## Hosting

We use [Pinata](https://pinata.cloud/) to deploy the application on IPFS.

Currently, there are no preview builds.

### Updating the production deployment

The upload to Pinata happens automatically in CI. Full process:

1. Open a PR from `main` to `production`, wait for CI to pass and merge
2. The merge triggers the "Deploy to IPFS" GitHub Actions workflow, which builds the app, uploads the build folder to
   Pinata and verifies that the CID reported by Pinata matches the CID of the build computed locally in CI
3. Open the workflow run summary, which shows the deployed CID (in both v0 and v1 form) and a preview URL
4. Verify that the preview loads - the fonts may look strange, but that's only because of security policies defined by
   the gateway and they will work without issues when used via ENS
5. Refer to the "Updating the name servers" section below to update the ENS name

The workflow can also be re-run manually from the GitHub Actions UI.

#### Manual upload (fallback)

If CI is unavailable, you can upload the build manually:

1. Run `git checkout production` to check out the production branch locally
2. Run `git pull` to pull the latest changes
3. Populate `.env.production.local` with production secrets
4. Run `pnpm install` to install the latest dependencies
5. Run `pnpm build` to create the production build
6. Run `PINATA_JWT=<JWT> pnpm upload-build-to-pinata` to upload the build folder to Pinata
7. Run `docker run --rm -v "$(pwd)/build:/build" ipfs/kubo add --only-hash --recursive /build` to verify the CID hash of
   the build folder with the deployed hash on Pinata
8. Verify the upload at https://app.pinata.cloud/ipfs/files. There should be an entry for the CID. Click the "build"
   link and make sure it loads.

#### Updating the name servers

The primary way to access the DAO dashboard is through the `api3.eth` ENS name, which points directly to the IPFS hash.
Then, the user can either use `https://api3.eth.limo` or connect to mainnet on their MetaMask (or use a browser which
supports resolving .eth domains) and visit `api3.eth/`. How this works is
[documented on IPFS](https://docs.ipfs.io/how-to/websites-on-ipfs/link-a-domain/#ethereum-naming-service-ens).

Assuming you have a v1 CID (`ipfs://bafy...`) and access to the api3.eth owner wallet, you can update the `api3.eth` to
the new version by following these steps:

1. Connect to the ENS application with the owner wallet of the api3.eth domain.
2. Go to api3.eth "Records" page and edit the "Content Hash".
3. Change the value to the new CID. Note, that the ENS app will also handle CID v0 and convert under the hood, but it's
   better to use the CID v1 directly.
4. Execute the TX. Note that it may take a bit of time until `https://api3.eth.limo` is updated.
