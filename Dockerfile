# This Dockerfile builds a mainnet version for Api3 DAO dashboard

FROM node:22-alpine AS builder
ARG REACT_APP_MAINNET_PROVIDER_URL
# The mainnet provider URL is required at build time
ENV REACT_APP_MAINNET_PROVIDER_URL=$REACT_APP_MAINNET_PROVIDER_URL
# The Wallet Connect project ID is required at build time, and it is OK to hardcode because the project ID
# is discoverable when using the dApp.
ENV REACT_APP_PROJECT_ID=0b2e430162b0e6c93619b3d65cf90d4e
RUN apk add --update --no-cache git $([ $(arch) == "aarch64" ] && echo "python3 make g++")
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate
WORKDIR /usr/src/app
ADD . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
