# This Dockerfile builds a mainnet version for API3 DAO dashboard

FROM node:lts-alpine as builder
RUN apk add --no-cache git
WORKDIR /usr/src/app
ADD . .
COPY src/contract-deployments/mainnet-dao.json ./src/contract-deployments/localhost-dao.example.json
RUN yarn 
RUN yarn tsc && yarn build

FROM nginx:alpine
EXPOSE 80
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
