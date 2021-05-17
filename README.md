# api3-dao-dashboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Instructions

To install dependencies, run `yarn`. This will also compile the DAO contracts and generate
[TypeChain](https://github.com/ethereum-ts/TypeChain) wrappers to be used in the client application.

1. To run the hardhat _(local blockchain simulator)_ use: `yarn eth:node`. This command will also deploy and export the
   deployment information under the hood for you _(similarly how `yarn eth:deploy:localhost` works)_.
2. In a separate terminal, start a development server with `yarn start`.
3. Run `yarn fund-account <address>` _(and optionally pass `amount` parameter)_ to send some ETH to your account.
4. You can use `yarn send-tokens:<network> <address>` _(and optionally pass `amount` parameter)_ to transfer some API3
   tokens.

MetaMask doesn't handle localhost development, particularly that the chain is reset after on every `yarn eth:node`. If
that happens, you can [reset the
account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

> If you need tokens for ropsten, ask [@siegrift](https://github.com/Siegrift) to send you some. Creating simple faucet
> for this is tracked under https://github.com/api3dao/api3-dao-dashboard/issues/16

The deployment task will make sure the DAO dashboard will use the contracts you have deployed.
You can use metamask (or any other wallet to connect to the application).
For more info see the [deployments section](#contract-deployments).

## Contract deployments

Currently supported networks are `localhost` and `ropsten` _(the `mainnet` network will be supported a bit later)_. Each
of these has a separate deploy command.

- You'll need to have credentials in `.env` _(see `.env.example`)_ when deploying to `ropsten` or `mainnet`.
- For deployments to localhost, you'll need to be running hardhat node. Use `yarn eth:node` for that.

Deployment scripts will deploy the necessary contracts to target chain and also export the deployed data to
`contract-deployments` folder in the dashboard app.

> Deployment files produced by localhost deployments are ignored, however deployment of all other networks is saved for
> checked in git and available for public.

_(Because, we can't conditionally and synchronously import ES modules, we copy `localhost-dao.example.json` as a
placeholder for `localhost-dao.json` deployment output.)_

### Automatic contaract deployments are BROKEN AT THE MOMENT

Unfortunately, aragon DAO contracts are not deployed as easily. Instead we use
[api3-dao](https://github.com/Siegrift/api3-dao/blob/c6d531162e3bc0b6931514c6bc92ed9c35763670/packages/dao/scripts/new-dao-instance.js)
for that. This deployment only works for localhost and there is an issue to make the deploy possible for other networks
https://github.com/api3dao/api3-dao/issues/217.

To make it possible to deploy to localhost, you'll need some initial preparation:

1. Run `yarn eth:node` - you'll need some local node running
2. Clone [forked-dao-repo](https://github.com/Siegrift/api3-dao) and `cd` into it.
3. Run `npm run bootstrap`
4. `cd packages/dao`
5. `npm run deploy:rpc`
6. If everything goes well, your it will deploy bunch of contract with no error

Follow these steps to deploy to localhost:

1. Run the localhost node `yarn eth:node`. It will also deploy the token and pool contract for you and export it to
   `localhost-dao.json`.
2. Copy the deployed address of the `Api3Pool` from `localhost-dao.json`
3. Open [forked-dao-repo](https://github.com/Siegrift/api3-dao)
4. `cd packages/dao`
5. Paste the address to the `API3_POOL_ADDRESS` variable in
   [new-dao-instance.js](https://github.com/Siegrift/api3-dao/blob/c6d531162e3bc0b6931514c6bc92ed9c35763670/packages/dao/scripts/new-dao-instance.js#L26)
   in the forked DAO repo
6. Run `npm run no-compile:deploy:localhost` - if this fails, try removing `arapp_local.json` and re-run.
7. It will print out JSON in following format:
   ```json
   {
     "votingPrimary": "0x18538A817401Eeff7be8eB3964959cecb5522532",
     "votingSecondary": "0xb43a9b2175786FcCb8C445a41529D8aEF99E5841",
     "agentPrimary": "0xDEB864805544b7415d211a8206684F9c5b906C1c",
     "agentSecondary": "0x92ccc96B4681683194fA1cF9A3212d332872821a"
   }
   ```
8. Paste the JSON to `voting-apps-addresses.json`
9. In the api3-dao-dahsboard, run `eth:set-dao-apps:localhost`
10. At this point you should have address of aragon apps _(agents and voting)_ exported in `localhost-dao.json`

### Contract deployments are not automatic

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
