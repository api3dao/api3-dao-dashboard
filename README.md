# api3-dao-dashboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Instructions

To install dependencies, run `yarn`. This will also compile the DAO contracts and generate
[TypeChain](https://github.com/ethereum-ts/TypeChain) wrappers to be used in the client application.

1. To run the hardhat _(local blockchain simulator)_ use: `yarn eth:node`.
2. To deploy the DAO contracts see [contract deployments instructions](#contract-deployments)
3. In a separate terminal, start a development server with `yarn start`.
4. Run `yarn send-to-account <address> --ether 5 --tokens 100` to send some ETH and tokens to your account.

MetaMask doesn't handle localhost development, particularly that the chain is reset after on every `yarn eth:node`. If
that happens, you can [reset the
account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

> If you need some testnet tokens, ask [@siegrift](https://github.com/Siegrift) to send you some. Creating simple faucet
> for this is tracked under https://github.com/api3dao/api3-dao-dashboard/issues/16

## Contract deployments

Currently supported networks are `localhost` and `ropsten` _(the `mainnet` network will be supported a bit later)_.
Deployments for other networks can be added if needed later.

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
`localhost-dao.example.json` as a placeholder for `localhost-dao.json` deployment output.

If you clone this repository, you'll se an error because `localhost-dao.json` will be missing. You can fix this by
creating a copy of `localhost-dao.example.json` and naming it `localhost-dao.json`.

### Deployments for other networks

Deployments for other networks work similarly and there are similar command to `deploy:rpc` for other networks. However
you might need to do additional steps and configuration before executing the deploy command. When adding deployment for
other networks check out `contracts/network.json` on what needs to be added.

See: https://github.com/api3dao/api3-dao/issues/217 for more information.

### Testnet and mainnet deployments are not automatic

It's important to mention that all deployed (hosted) applications will connect to the contracts specified in
`contract-deployments/<chain-name>-dao.json`. This means, that you need to redeploy the contracts manually before
hosting the testnet or mainnet networks.

## Hosting

We use [Fleek](https://fleek.co/) to host the application on IPFS. The hosting workflow works like this:

- Every PR against `main` branch will be deployed as github action and you can find the IPFS hash in the "fleek deploy
  check" details.
- The current version of app in `main` branch will be deployed as staging on the following URL:
  https://blue-field-6902.on.fleek.co/. The app will be redeployed after every merged request automatically.
- Every push to `production` branch will trigger a production deploy. The app can be found on this URL:
  https://late-butterfly-0267.on.fleek.co/

> There is an [issue](https://github.com/api3dao/api3-dao-dashboard/issues/2) to setup ENS name for the production app
> to avoid the strange name. Also, to keep fleek usage for free, only [@siegrift](https://github.com/Siegrift) has the
> access rights to deployment dashboard.

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
