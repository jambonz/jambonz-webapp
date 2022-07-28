FROM node:18.6.0-alpine as builder
RUN apk update && apk add --no-cache python3 make g++
COPY . /opt/app
WORKDIR /opt/app/
COPY package.json ./
RUN npm install
RUN npm run build
RUN npm prune

FROM node:18.6.0-alpine as webapp
RUN apk add curl
WORKDIR /opt/app
COPY . /opt/app
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/build ./build
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]