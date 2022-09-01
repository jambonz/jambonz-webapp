<p align="center">
  <a href="https://jambonz.org">
    <img src="../public/icon192.png" height="128">
    <h1 align="center">jambonz</h1>
  </a>
</p>

<p align="center">
  <a aria-label="GitHub CI" href="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml">
    <img alt="" src="https://github.com/jambonz/jambonz-webapp/actions/workflows/main.yml/badge.svg">
  </a>
</p>

> Setting up a local test environment

This document describes how to set up a local development and test environment on your laptop.
Testing the jambonz-webapp requires a back-end system to run against, and we use docker-compose
to run these back-end components, allowing you to develop and test the web app UI locally.

## Prerequisites

- You will need to have docker and docker-compose installed on your laptop.
- You need to have cloned the [jambonz-api-server](https://github.com/jambonz/jambonz-api-server) repo to a folder on your laptop.

## Running the back-end services

Make sure the docker daemon is running on your laptop. Open a terminal window and cd into the
project folder for jambonz-api-server, then run the following command to start the back-end processes.

```bash
cd jambonz-api-server
npm run integration-test
```

This will take a few minutes to start, but eventually a successfull startup will eventually
look something like this:

```bash
$ npm run integration-test

> jambonz-api-server@v0.7.5 integration-test
> NODE_ENV=test JAMBONES_TIME_SERIES_HOST=127.0.0.1 AWS_REGION='us-east-1' JAMBONES_CURRENCY=USD JWT_SECRET=foobarbazzle JAMBONES_MYSQL_HOST=127.0.0.1 JAMBONES_MYSQL_PORT=3360 JAMBONES_MYSQL_USER=jambones_test JAMBONES_MYSQL_PASSWORD=jambones_test JAMBONES_MYSQL_DATABASE=jambones_test JAMBONES_REDIS_HOST=localhost JAMBONES_REDIS_PORT=16379 JAMBONES_LOGLEVEL=debug JAMBONES_CREATE_CALL_URL=http://localhost/v1/createCall node test/serve-integration.js

starting dockerized mysql and redis..
mysql is running
creating database..
creating schema..
seeding database..
creating admin user..
reset_admin_password, initial admin password is admin


sipp exited with non-zero code 1 signal null
1
ready for testing!
{"level":30, "time": "2022-04-14T18:07:49.318Z","pid":5292,"hostname":"MacBook-Pro-2.local","msg":"listening for HTTP traffic on port 3000","v":1}
{"level":20, "time": "2022-04-14T18:07:49.325Z","pid":5292,"hostname":"MacBook-Pro-2.local","args":[],"msg":"redis event connect","v":1}
{"level":20, "time": "2022-04-14T18:07:49.345Z","pid":5292,"hostname":"MacBook-Pro-2.local","args":[],"msg":"redis event ready","v":1}
```

This starts the a docker-compose network running the following containers:

- mysql
- redis
- influxdb
- heplify-server
- drachtio
- homer-webapp

Leaving the jambonz-api-server process running, open another terminal window, cd into the
folder where you have checked out this project, and start it as shown below:

```
cd jambonz-webapp
npm i
npm start
```

This will start the web app UI on http://localhost:3001.

You should now see the login page to the jambonz webapp and can log in with username admin and
password admin. You will be forced to change the password, and then you should see the main page
of the application.

From here you can make and test changes locally.

## Testing with remote server

If you want to test against a remote server, you must specify the ip:port of
the Jambonz API you will be hitting.

1. Copy `.env` to `.env.local`
2. In `.env.local`, replace `[ip]:[port]` with the API's IP and port
3. `npm start`
4. Access the web app via http://localhost:3001
