# api3-dao-dashboard

The implementation of the DAO dashboard.

[![ContinuousBuild](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml)

## Running dashboard on Mainnet in docker container

The decentralized approach of being a DAO member is to run API3 dashboard on your local machine. For that you will just
need `git` and `docker`:

```
git clone --depth=1 git@github.com:api3dao/api3-dao-dashboard.git
cd api3-dao-dashboard
docker build -t api3-dao-dashboard .
docker run -d -p7770:80 --name api3-dao-dashboard api3-dao-dashboard
```

This will create a API3 dashboard running on port 7770 of your localhost where it is safe to connect your wallet.

## Instructions for testing on Rinkeby

1. Install Metamask (https://metamask.io/download)
2. Create a wallet, connect to the Rinkeby network
3. Get some Rinkeby ETH from https://faucet.rinkeby.io/
<!-- markdown-link-check-disable-next-line -->
4. Go to the API3 token faucet at
   https://rinkeby.etherscan.io/address/0xd8eC2c4158a0Cb65Dd42E2d1C1da8EA11975Ba22#writeContract
5. Click “Connect to Web3”
6. Click “4. withdraw” and Write. Make the transaction. Each time you do this you will receive 1000 API3.

## Development instructions

To install dependencies, run `yarn`. This will also compile the DAO contracts and generate
[TypeChain](https://github.com/ethereum-ts/TypeChain) wrappers to be used in the client application.

1. To run the hardhat _(local blockchain simulator)_ use: `yarn eth:node`
2. Run `yarn eth:prepare-dao-contracts-for-hardhat` and `yarn eth:deploy-dao-contracts-on-hardhat`. See
   [contract deployments instructions](#contract-deployments) for more details
3. In a separate terminal, start a development server with `yarn start`
4. Run `yarn send-to-account <address> --ether 5 --tokens 100` to send some ETH and tokens to your account

_(If connecting to a public testnet like Ropsten or Rinkeby, you can simply run `yarn start` and switch your Metamask
network)_

<!-- markdown-link-check-disable -->
<!-- The "how to reset account link does work, but the github actions check says it returns 403" -->

> MetaMask doesn't handle localhost development ideally. Particularly, that the chain is reset after on every
> `yarn eth:node` command. In case you have problems making a transaction, try to
> [reset the account](https://metamask.zendesk.com/hc/en-us/articles/360015488891-How-to-reset-your-wallet).

<!-- markdown-link-check-enable -->

### Contract deployments

Currently supported networks are `localhost` and `rinkeby` and `mainnet`.

Unfortunately, aragon DAO contracts are not deployed easily. The easiest solution is to compile
[using the script created inside api3-dao](https://github.com/api3dao/api3-dao/blob/develop/packages/dao/scripts/deploy.js).
However, when deploying to localhost you can use the scripts which automate this for you.

### Localhost deployment

There are essentially two scripts, `eth:prepare-dao-contracts-for-hardhat` and `eth:deploy-dao-contracts-on-hardhat`.

The former downloads the repository which contains the DAO contracts and installs all it's dependencies. You need to run
this everytime the DAO contract dependencies change.

The latter assumes the repository is already initialized and it compiles and deploys the contracts on already running
hardhat node.

You can see the implementation of those scripts if you prefer to deploy manually.

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

Apart from that, we are using
[environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/), specifically
`REACT_APP_NODE_ENV` to signal on which environment we are. Possible values `development`, `staging` and `production`.

### Hosting new version of production app

All you need to do is push the code to `production` branch. Most of the times you just want to copy what's on `main`
branch:

1. `git checkout production`
2. `git merge main`
3. `git push`

#### Updating the name servers

The primary way to access the DAO dashboard is through the `api3.eth` ENS name, which points directly to the IPFS hash.
Then, the user can either connect to mainnet on their Metamask and visit `api3.eth/` (the recommended way), or they can
visit `https://api3.eth.link/`.

<!-- markdown-link-check-disable -->
<!-- The link below exists and works, but the github actions check says it does not" -->

Unfortunately, this is reported to be down frequently, see
[this](https://blog.cloudflare.com/cloudflare-distributed-web-resolver/) for more information.

<!-- markdown-link-check-enable -->

Thus, we have also forwarded `https://dao.api3.org` to the IPFS hash (using the `dweb.link` gateway), but we do not
recommend using this unless necessary.

After pushing to the production branch, verify the Fleek build (see below). Then,
[point `api3.eth` to the new CID](https://docs.ipfs.io/how-to/websites-on-ipfs/link-a-domain/#ethereum-naming-service-ens).

<!-- markdown-link-check-disable -->
<!-- The link below exists and works, but the github actions check says it does not" -->

Then, with the Cloudflare account that manages `api3.org`,
[update the page rule](https://support.cloudflare.com/hc/en-us/articles/200172286-Configuring-URL-forwarding-or-redirects-with-Cloudflare-Page-Rules)
to direct `dao.api3.org` to the URL pointing to the new deployment through the `dweb.link` gateway (you can get this URL
from the [ENS dashboard](https://app.ens.domains/name/api3.eth)).

<!-- markdown-link-check-enable -->

`https://dao.api3.org` and `api3.eth/` will start forwarding to the new deployment instantly, while
`https://api3.eth.link/` will have to wait for the DNS information to propagate (may take up to 2 hours).

### Verifying the Fleek build

We're using Fleek to build and deploy the dashboard. To avoid trusting Fleek to build and deploy the app correctly, one
can also build it locally and compare its hash with the IPFS deployment.

To do so, first create a `docker-compose.yml` as explained
[here](https://docs.fleek.co/hosting/site-deployment/#testing-deployments-locally) in this repo

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

Then, (after installing `ipfs`) run `sudo ipfs add --only-hash --recursive ./build` to get the hash of the build (`sudo`
because `build` will likely be owned by root). This should be the same as the IPFS hash as the one on the Fleek
dashboard and what our ENS is pointing towards.

## Error Monitoring

Please note that the API3 core team tracks application errors on test and production environments using
[Sentry](https://sentry.io). This is solely used to fix errors and improve the user experience.

**NOTE: No identifying user information is collected**

If hosting yourself, you can test Sentry by creating your own account and following the
[React installation guide](https://docs.sentry.io/platforms/javascript/guides/react/)
