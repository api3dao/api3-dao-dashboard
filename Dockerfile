# This Dockerfile builds a mainnet version for API3 DAO dashboard

FROM node:16-alpine as builder
RUN apk add --update --no-cache git $([ $(arch) == "aarch64" ] && echo "python3 make g++")
WORKDIR /usr/src/app
ADD . .
RUN yarn 
RUN yarn build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
