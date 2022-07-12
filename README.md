<p align="center">
  <a href="https://jambonz.org">
    <img src="./public/icon192.png" height="128">
    <h1 align="center">jambonz</h1>
  </a>
</p>

<p align="center">
  <a aria-label="GitHub CI" href="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml">
    <img alt="" src="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml/badge.svg">
  </a>
</p>

> A simple provisioning webapp for jambonz

## OSS Developers

If you're here to contribute to the jambonz web app source code
you can view our [contributor readme](./docs/contributors.md).

## Webapp deployment

### Deploy to production

1. Install `pm2` globally on the server hosting this application.
2. Copy `.env` to `.env.local`
3. In `.env.local`, replace `[ip]:[port]` with the API's IP and port
4. Run `npm run deploy`
5. Access the web app via port 3001

_NOTE: Here is what `npm run deploy` does:_

- Install all dependencies (`npm i`)
- Build the production React application (`npm run build`)
- Launch the app with pm2 (`pm2 start npm --name "jambonz-webapp" -- run serve`)

Alternatively, you can serve the app manually (without pm2) with `npm run serve`.

### Update production

If there is an update to this code base, you can update the code without re-deploying.

1. run `git pull origin main --rebase`
2. run `npm i`
3. run `npm run build`

### With docker

You can pull the public docker image for the web app:

```sh
docker pull ghcr.io/jambonz/webapp:latest
```

You can run the docker image for the webapp and expose the serve port to the host:

```sh
docker run --publish=3001:3001 ghcr.io/jambonz/webapp:latest
```

You can build and run the docker image from the source, for example:

```sh
docker build . --tag jambonz-webapp:local
docker run --publish=3001:3001 jambonz-webapp:local
```
