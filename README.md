# api3-dao-dashboard

The implementation of the DAO dashboard.

[![ContinuousBuild](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml)

## Running dashboard on Mainnet in docker container

The decentralized approach of being a DAO member is to run API3 dashboard on your local machine. For that you will just
need `git` and `docker`. Note, that the production source code is on the `production` branch.

```
git clone --depth=1 --branch production git@github.com:api3dao/api3-dao-dashboard.git
cd api3-dao-dashboard
docker build -t api3-dao-dashboard .
docker run -d -p7770:80 --name api3-dao-dashboard api3-dao-dashboard
```

This will create a API3 dashboard running on port 7770 of your localhost where it is safe to connect your wallet.

Once you are finished interacting with the dashboard, the container can be stopped using
`docker stop api3-dao-dashboard` and then removed using `docker rm api3-dao-dashboard`. To avoid having to execute the
latter command to remove the container, add the `--rm` flag to the above `docker run` command.

## Development instructions

We use the `main` branch to develop new features. For production code, see the
[the production branch](https://github.com/api3dao/api3-dao-dashboard/tree/production).

### Running on mainnet or testnets

1. `yarn` - to install dependencies and generate TypeScript types
2. `yarn start` - to start the application on localhost on port 3000

### Running with hardhat

1. `yarn` - to install dependencies and generate TypeScript types
2. `yarn eth:node` - to start hardhat network
3. `yarn eth:prepare-dao-contracts-for-hardhat` - to download the DAO contract sources locally. You need to run this
   only when running for the first time.
4. (Optional) Modify the pool contract `EPOCH_LENGTH` variable from `1 weeks` to `1 minutes` to speed up testing. You
   can find this constant inside `dao-contracts/api3-dao/packages/pool/contracts/StateUtils.sol`
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

### Claims/Policies development

You need a policy that is linked to your account in order to create a claim. You can create a policy for your account by
running:

`yarn create-user-policy --address <address> --coverage-amount 500 --metadata 'BTC/USD'`

### Supported networks

Currently, only `hardhat`, `rinkeby` and `mainnet` networks are supported. If you want to test the application on a
different network, adapt the configuration to your needs.

## Hosting

We use [Fleek](https://fleek.co/) to host the application on IPFS. The hosting workflow works like this:

- Every PR against `main` branch will be deployed by github action (as preview deployment) and you can find the IPFS
  hash in the "fleek deploy check" details in the PR status checks panel.
- The current version of app in `main` branch will be deployed as staging on the following URL:
  https://api3-dao-dashboard-staging.on.fleek.co/. The app will be redeployed after every merged request automatically
- Every push to `production` branch will trigger a production deploy. The app can be found on this URL:
  https://api3-dao-dashboard.on.fleek.co/

Apart from that, we are using
[environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/), specifically
`REACT_APP_NODE_ENV` to specify the environment. Possible values `development`, `staging` and `production`.

### Hosting new version of production app

All you need to do is push the code to `production` branch. Most of the times you just want to copy what's on `main`
branch:

1. `git checkout production`
2. `git merge main`
3. `git push`

### Updating the name servers

The primary way to access the DAO dashboard is through the `api3.eth` ENS name, which points directly to the IPFS hash.
Then, the user can either connect to mainnet on their Metamask and visit `api3.eth/` (the recommended way), or they can
visit `https://api3.eth.link/`.

<!-- markdown-link-check-disable -->
<!-- The link below exists and works, but the github actions check says it does not" -->

Unfortunately, the `https://api3.eth.link/` is reported to be down frequently, see
[this](https://blog.cloudflare.com/cloudflare-distributed-web-resolver/) for more information.

<!-- markdown-link-check-enable -->

After pushing to the production branch, verify the Fleek build (see below). Then,
[point `api3.eth` to the new CID](https://docs.ipfs.io/how-to/websites-on-ipfs/link-a-domain/#ethereum-naming-service-ens).

<!-- markdown-link-check-disable -->
<!-- The link below exists and works, but the github actions check says it does not" -->

Then, with the Cloudflare account that manages `api3.org`,
[update the page rule](https://support.cloudflare.com/hc/en-us/articles/200172286-Configuring-URL-forwarding-or-redirects-with-Cloudflare-Page-Rules)
to direct `https://api3.eth.link/#/` to the URL pointing to the new deployment through the `dweb.link` gateway (you can
get this URL from the [ENS dashboard](https://app.ens.domains/name/api3.eth)).

<!-- markdown-link-check-enable -->

`api3.eth/` will start forwarding to the new deployment instantly, while `https://api3.eth.link/` will have to wait for
the DNS information to propagate (may take up to 2 hours).

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
