# This Dockerfile builds a mainnet version for API3 DAO dashboard

FROM node:lts-alpine as builder
RUN apk add --no-cache git
WORKDIR /usr/src/app
ADD . .
RUN yarn 
RUN yarn build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
