# api3-dao-dashboard

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Instructions

To install dependencies, run `yarn`.
To start a development server run `yarn start`.

## Deploy and hosting

We use [Fleek](https://fleek.co/) to deploy the application on IPFS. The deploy workflow works like this:

- Every PR against `main` branch will be deployed as github action and you can find the IPFS hash in the "fleek deploy check" details.
- The current version of app in `main` branch will be deployed as staging on the following URL: https://blue-field-6902.on.fleek.co/. The app will be redeployed after every merged request automatically.
- Every push to `production` branch will trigger a production deploy. The app can be found on this URL: https://late-butterfly-0267.on.fleek.co/

> There is an [issue](https://github.com/api3dao/api3-dao-dashboard/issues/2) to setup ENS name for the production app to avoid the strange name. Also, to keep fleek usage for free, only [@siegrift](https://github.com/Siegrift) has the access rights to deployment dashboard.

Apart from that, we are using [environment variables](https://create-react-app.dev/docs/adding-custom-environment-variables/), specifically `REACT_APP_NODE_ENV` to signal on which environment we are. Possible values `staging` and `production`.

### Publishing new version of production app

All you need to do is push the code to `production` branch. Most of the times you just want to copy what's on `main` branch:

1. `git checkout production`
2. `git merge main`
3. `git push`

> Note: As of now it's possible to push directly to production, but this will change after https://github.com/api3dao/api3-dao-dashboard/issues/5 is resolved.
