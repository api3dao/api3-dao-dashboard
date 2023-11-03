# api3-dao-dashboard [![ContinuousBuild](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml)

The implementation of the DAO dashboard.

We use the `main` branch to develop new features. For production code, see the
[production branch](https://github.com/api3dao/api3-dao-dashboard/tree/production).

## Development instructions

You can find development instructions in a separate [dev-README](./dev-README.md).

## Running the dashboard on Mainnet in a Docker container

The decentralized approach to being a DAO member is to run API3 dashboard on your local machine. For that you will just
need `docker` and, optionally, `git`.

There are two approaches to running the dashboard locally. The first involves using the prebuilt Docker image, while the
second involves building the image from source. In either case, the end result is a API3 dashboard running on port 7770
of your localhost where it is safe to connect your wallet.

Currently, it's only possible to build the Docker image on a UNIX-like OS. If you use Windows, you can use WSL2.

### Running the prebuilt image

The simplest way to run the dashboard locally is using the prebuilt Docker image. This image is built and pushed to
Docker Hub automatically when new commits are added to the `production` branch.

```sh
docker run --rm --publish 7770:80 --name api3-dao-dashboard api3/dao-dashboard:latest
```

### Building from source

Alternatively, you can build the Docker image from source. Note that the production code is located on the `production`
branch.

```sh
git clone --depth=1 --branch production https://github.com/api3dao/api3-dao-dashboard.git
cd api3-dao-dashboard
docker build --tag api3-dao-dashboard .
docker run --rm --publish 7770:80 --name api3-dao-dashboard api3-dao-dashboard
```

## Verifying the Fleek build

We're using Fleek to build and deploy the dashboard. To avoid trusting Fleek with build and deployments, one can also
build the app locally and compare its hash with the hash of IPFS deployment.

To do so, first create a `docker-compose.yml` as explained
[here](https://docs.fleek.co/hosting/site-deployment/#testing-deployments-locally) in this repo. See the Fleek
configuration for the values in the `environment` field.

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
      - REACT_APP_NODE_ENV=...
      - REACT_APP_SENTRY_DSN=...
      - REACT_APP_MAINNET_PROVIDER_URL=...
      - REACT_APP_PROJECT_ID=...
    volumes:
      - './:/workspace'
```

and run `docker-compose run --rm app`, which will create a `./build` directory.

Then, (after installing IPFS Kubo) run `sudo ipfs add --only-hash --recursive ./build` to get the hash of the build
(`sudo` because `build` will likely be owned by root). This should be the same as the IPFS hash as the one on the Fleek
dashboard and what our ENS record is pointing towards.

## Error Monitoring

Please note that the API3 core team tracks application errors on test and production environments using
[Sentry](https://sentry.io). This is solely used to fix errors and improve the experience of our users.

**NOTE: No identifying user information is collected**

If hosting yourself, you can test Sentry by creating your own account and following the
[React installation guide](https://docs.sentry.io/platforms/javascript/guides/react/)
