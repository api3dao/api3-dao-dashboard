# This Dockerfile builds a mainnet version for API3 DAO dashboard

FROM node:lts-alpine as builder
RUN apk add --update --no-cache git $([ $(arch) == "aarch64" ] && echo "python3 make g++")
WORKDIR /usr
RUN git clone --depth=1 --branch production https://github.com/api3dao/api3-dao-dashboard.git
RUN cd api3-dao-dashboard
WORKDIR /usr/api3-dao-dashboard
RUN yarn
RUN yarn build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /usr/api3-dao-dashboard/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
