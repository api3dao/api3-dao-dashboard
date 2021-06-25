# api3-dao-dashboard

The implementation of the DAO dashboard.

## Instructions for testing on Rinkeby

1. Install Metamask (https://metamask.io/download)
2. Create a wallet, connect to the Rinkeby network
3. Get some Rinkeby ETH from https://faucet.rinkeby.io/
4. Go to the API3 token faucet at https://rinkeby.etherscan.io/address/0xd8eC2c4158a0Cb65Dd42E2d1C1da8EA11975Ba22#writeContract
5. Click “Connect to Web3”
6. Click “4. withdraw” and Write. Make the transaction. Each time you do this you will receive 1000 API3.

## Development instructions

To install dependencies, run `yarn`. This will also compile the DAO contracts and generate
[TypeChain](https://github.com/ethereum-ts/TypeChain) wrappers to be used in the client application.

1. To run the hardhat _(local blockchain simulator)_ use: `yarn eth:node`
2. To deploy the DAO contracts see [contract deployments instructions](#contract-deployments)
3. In a separate terminal, start a development server with `yarn start`
4. Run `yarn send-to-account <address> --ether 5 --tokens 100` to send some ETH and tokens to your account

_(If connecting to a public testnet like Ropsten or Rinkeby, you can simply run `yarn start` and switch your Metamask
network)_

> MetaMask doesn't handle localhost development ideally. Particularly, that the chain is reset after on every `yarn eth:node` command. In case you have problems making a transaction, try to [reset the
> account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

### Contract deployments

Currently supported networks are `localhost` and `rinkeby` _(the `mainnet` network will be supported a bit later)_.

Unfortunately, aragon DAO contracts are not deployed easily. The easiest solution is to compile [using the script
created inside api3-dao](https://github.com/api3dao/api3-dao/blob/develop/packages/dao/scripts/deploy.js).

### Localhost deployment

To make it possible to deploy to localhost, you'll need some initial preparation:

1. Clone [api3-dao](https://github.com/api3dao/api3-dao) and `cd` into it.
2. Run `npm run bootstrap`

Follow these steps to deploy to localhost:

1. Run the localhost node `yarn eth:node`
2. Navigate to the DAO contracts repo `cd api3-dao/packages/dao`
3. Run `npm run deploy:rpc` - If you get `RangeError: Maximum call stack size exceeded`, check out the solution in
   https://api3workspace.slack.com/archives/C020RCCC3EJ/p1621327622001300 (increase stack size limit)
4. If everything goes well, your it will deploy bunch of contracts and print out JSON in following format:
   ```json
   {
     "api3Token": "0x5fbdb2315678afecb367f032d93f642f64180aa3",
     "api3Pool": "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
     "convenience": "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
     "votingAppPrimary": "0xc8f18fc8faf682ce4b27124a4ab7f976ab10292f",
     "votingAppSecondary": "0xd78bc0f7cdbb88eba36eed08c1152f80fbebbbce",
     "agentAppPrimary": "0x600214cfaf9f0734659f57656f31e4a11e833f40",
     "agentAppSecondary": "0x71f1337dc27cd188b3c116b0b874311efe144a0a"
   }
   ```
5. Paste that JSON into `src/contract-deployments/localhost-dao.json` inside this project
6. The dashboard app is now ready to connect these deployed contracts

#### Deployment file for localhost

Deployment file for localhost deployment is ignored, however deployment addresses of all other networks is saved for
checked in git and available for public. Because, we can't conditionally and synchronously import ES modules, we include
`localhost-dao.example.json` as a placeholder for `localhost-dao.json` deployment output. We take care of creating this
file in `yarn postinstall` script, so you don't need to create it manually.

#### Deployments for other networks

Deployments for other networks work similarly and there are similar command to `deploy:rpc` for other networks. However
you might need to do additional steps and configuration before executing the deploy command. When adding deployment for
other networks check out `contracts/network.json` on what code needs to be added for in the DAO dashboard.

See: https://github.com/api3dao/api3-dao/issues/217 for more information.

#### Testnet and mainnet deployments are not automatic

It's important to mention that all deployed (hosted) applications will connect to the contracts specified in
`contract-deployments/<chain-name>-dao.json`. This means, that you need to redeploy the contracts manually before
hosting the testnet or mainnet networks.

## Hosting

We use [Fleek](https://fleek.co/) to host the application on IPFS. The hosting workflow works like this:

- Every PR against `main` branch will be deployed as github action and you can find the IPFS hash in the "fleek deploy
  check" details.
- The current version of app in `main` branch will be deployed as staging on the following URL:
  https://api3-dao-dashboard-staging.on.fleek.co/. The app will be redeployed after every merged request automatically
- Every push to `production` branch will trigger a production deploy. The app can be found on this URL:
  https://api3-dao-dashboard.on.fleek.co/

Apart from that, we are using [environment
variables](https://create-react-app.dev/docs/adding-custom-environment-variables/), specifically `REACT_APP_NODE_ENV` to
signal on which environment we are. Possible values `development`, `staging` and `production`.

### Hosting new version of production app

All you need to do is push the code to `production` branch. Most of the times you just want to copy what's on `main`
branch:

1. `git checkout production`
2. `git merge main`
3. `git push`

> Note: As of now it's possible to push directly to production, but this will change after
> https://github.com/api3dao/api3-dao-dashboard/issues/5 is resolved.

### Verifying the Fleek build

We're using Fleek to build and deploy the dashboard.
To avoid trusting Fleek to build and deploy the app correctly, one can also build it locally and compare its hash with the IPFS deployment.

To do so, first create a `docker-compose.yml` as explained [here](https://docs.fleek.co/hosting/site-deployment/#testing-deployments-locally) in this repo

```yml
version: '3.7'
services:
  verdaccio:
    container_name: verdaccio
    image: verdaccio/verdaccio
    ports:
      - '4873:4873'

  app:
    image: fleek/create-react-app
    command: sh -c 'npm set registry http://verdaccio:4873 && yarn && yarn build'
    working_dir: /workspace/build
    environment:
      - REACT_APP_NODE_ENV=staging
      - REACT_APP_RINKEBY_PROVIDER_URL=https://rinkeby.infura.io/v3/...
    volumes:
      - './:/workspace'
```

and run `docker-compose run --rm app`, which will create a `./build` directory.

Then, (after installing `ipfs`) run `sudo ipfs add --only-hash --recursive ./build` to get the hash of the build (`sudo` because `build` will likely be owned by root).
This should be the same as the IPFS hash as the one on the Fleek dashboard and what our ENS/IPNS is pointing towards.

## Error Monitoring

Please note that the API3 core team tracks application errors on test and production environments using [Sentry](https://sentry.io). This is solely used to fix errors and improve the user experience.

**NOTE: No identifying user information is collected**

If hosting yourself, you can test Sentry by creating your own account and following the [React installation guide](https://docs.sentry.io/platforms/javascript/guides/react/)
