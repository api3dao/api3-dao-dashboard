# api3-dao-dashboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Instructions

To install dependencies, run `yarn`.

1. To run the hardhat _(local blockchain simulator)_ use: `yarn eth:node`
2. Open a new terminal and deploy the DAO contracts: `yarn eth:deploy:localhost`
3. In a separate terminal, start a development server with `yarn start`.

The deployment task will make sure the DAO dashboard will use the contracts you have deployed.
You can use metamask (or any other wallet to connect to the application).
For more info see the [deployments section](#contract-deployments).

## Contract deployments

Currently supported networks are `localhost`, `ropsten` and `mainnet`. Each of these has a separate deploy command.
- You'll need to have credentials in `.env` _(see `.env.example`)_ when deploying to `ropsten` or `mainnet`.
- For deployments to localhost, you'll need to be running hardhat node. Use `yarn eth:node` for that.

Deployment scripts will deploy the necessary contracts to target chain and also export the deployed data to
`contract-deployments` folder in the dashboard app. 

> Deployment files produced by localhost deployments are ignored, however deployment of all other networks is saved for
> checked in git and available for public.

### Contract deployments are not automatic

It's important to mention that all deployed (hosted) applications will connect to the contracts specified in
`contract-deployments/dao.json`. This means, that you need to redeploy the contracts manually before hosting the testnet
or mainnet networks.

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
signal on which environment we are. Possible values `staging` and `production`.

### Hosting new version of production app

All you need to do is push the code to `production` branch. Most of the times you just want to copy what's on `main`
branch:

1. `git checkout production`
2. `git merge main`
3. `git push`

> Note: As of now it's possible to push directly to production, but this will change after
> https://github.com/api3dao/api3-dao-dashboard/issues/5 is resolved.
