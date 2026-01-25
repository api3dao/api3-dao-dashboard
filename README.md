# api3-dao-dashboard [![ContinuousBuild](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/api3dao/api3-dao-dashboard/actions/workflows/main.yml)

The implementation of the DAO dashboard.

We use the `main` branch to develop new features. For production code, see the
[production branch](https://github.com/api3dao/api3-dao-dashboard/tree/production).

## Development instructions

You can find development instructions in a separate [dev-README](./dev-README.md).

## Running the dashboard on Mainnet in a Docker container

The decentralized approach to being a DAO member is to run Api3 dashboard on your local machine. For that you will just
need `docker` and, optionally, `git`.

There are two approaches to running the dashboard locally. The first involves using the prebuilt Docker image, while the
second involves building the image from source. In either case, the end result is a Api3 dashboard running on port 7770
of your localhost where it is safe to connect your wallet.

Currently, it's only possible to build the Docker image on a UNIX-like OS. If you use Windows, you can use WSL2.

### Running the prebuilt image

The simplest way to run the dashboard locally is using the prebuilt Docker image. This image is built and pushed to
Docker Hub automatically when new commits are added to the `production` branch.

```sh
docker run --rm --publish 7770:80 --name api3-dao-dashboard api3/dao-dashboard:latest
```

### Building from source

Alternatively, you can build the Docker image from source. Note that:

- the production code is located on the `production` branch
- you need to provide your mainnet provider URL as a build arg (`REACT_APP_MAINNET_PROVIDER_URL`) when building the
  image

```sh
git clone --depth=1 --branch production https://github.com/api3dao/api3-dao-dashboard.git
cd api3-dao-dashboard
docker build --build-arg="REACT_APP_MAINNET_PROVIDER_URL=..." --tag api3-dao-dashboard .
docker run --rm --publish 7770:80 --name api3-dao-dashboard api3-dao-dashboard
```

## Verifying the IPFS CID

We're using Pinata to upload the dashboard to IPFS. To avoid trusting Pinata not to temper with the uploaded files, one
can also build the app locally and compare its CID with the CID of the IPFS deployment.

To verify the CID, use the following instructions:

1. (Optional) Clone a fresh version of the repository
2. Run `git checkout production` to check out the production branch (assuming the verification is for production)
3. Run `yarn` to install the latest dependencies
4. Populate `.env.production.local` with production secrets
5. Run `yarn build` to create a fresh production build
6. Run `docker run --rm -v "$(pwd)/build:/build" ipfs/kubo add --only-hash --recursive /build` to obtain the CIDv0
7. To obtain the corresponding CID in v1 follow the section below

### CIDv0 vs CIDv1

If the expected hash looks like `bafy...` (shown on ENS) and locally it looks like `Qm...` (as uploaded by Pinata) that
is because of a difference between CIDv0 and CIDv1. Refer to the
[CID version documentation](https://docs.ipfs.tech/concepts/content-addressing/#cid-versions) for details. To convert a
CID from v0 to v1 use:

```
docker run --rm ipfs/kubo cid format -v 1 -b base32 <CID_V0>
```

## Error Monitoring

Please note that the Api3 core team tracks application errors on test and production environments using
[Sentry](https://sentry.io). This is solely used to fix errors and improve the experience of our users.

**NOTE: No identifying user information is collected**

If hosting yourself, you can test Sentry by creating your own account and following the
[React installation guide](https://docs.sentry.io/platforms/javascript/guides/react/)
