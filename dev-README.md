# Development instructions

The DAO dashboard README is reserved for tech savvy users who want to learn more about how is the DAO dashboard
implemented and its security. All developer oriented instructions can be found here.

## Running with hardhat

1. `yarn` - to install dependencies and generate TypeScript types
2. `yarn eth:node` - to start hardhat network
3. `yarn eth:prepare-dao-contracts-for-hardhat` - to download the DAO contract sources locally. You need to run this
   only when running for the first time.
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

Currently, only `hardhat`, `rinkeby` and `mainnet` networks are supported. If you want to test the application on a
different network, adapt the configuration to your needs.

## Hosting

We use [Fleek](https://fleek.co/) to host the application on IPFS. The hosting workflow works like this:

- Every PR against `main` branch will be deployed by Github Actions (as preview deployment) and you can find the IPFS
  hash in the "fleek deploy check" details in the PR status checks panel.
- The current version of app in `main` branch will be deployed as staging on the following URL:
  https://api3-dao-dashboard-staging.on.fleek.co/. The app will be redeployed after every merged request automatically.
- Every push to `production` branch will trigger a production deploy. The production can be found on this URL:
  https://api3-dao-dashboard.on.fleek.co/.

On Fleek, we are using [environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/),
specifically `REACT_APP_NODE_ENV` to specify the environment. Possible values `development`, `staging` and `production`.

### Updating the production deployment

All you need to do is merge a PR to `production` branch. Most of the times you just want to open a new PR from the
`main` branch.

### Updating the name servers

The primary way to access the DAO dashboard is through the `api3.eth` ENS name, which points directly to the IPFS hash.
Then, the user can either connect to mainnet on their Metamask (or use a browser which supports resolving .eth domains)
and visit `api3.eth/`.

After pushing to the production branch, [verify the Fleek build](./README.md#verifying-the-fleek-build). Then,
[point `api3.eth` to the new CID](https://docs.ipfs.io/how-to/websites-on-ipfs/link-a-domain/#ethereum-naming-service-ens).
