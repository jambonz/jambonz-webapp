FROM --platform=linux/amd64 node:18.12.1-alpine3.16 as base

RUN apk --update --no-cache add --virtual .builds-deps build-base curl python3

WORKDIR /opt/app/

FROM base as build

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM base

COPY --from=build /opt/app /opt/app/

RUN chmod +x /opt/app/entrypoint.sh

ENTRYPOINT ["/opt/app/entrypoint.sh"]