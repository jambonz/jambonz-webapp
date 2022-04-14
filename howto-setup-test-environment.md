# Setting up a local test environment
This document describes how to set up a local development and test environment on your laptop.  Testing the jambonz-webapp requires a back-end system to run against, and we use docker-compose to run these back-end components, allowing you to develop and test the react UI locally.

## Prerequisites
- You will need to have docker an docker-compose installed on your laptop.
- You need to have checkout the [jambonz-api-server](https://github.com/jambonz/jambonz-api-server) project to a folder on your laptop.

## Running the back-end services
Make sure the docker daemon is running on your laptop.  Open a terminal window and cd into the folder containing the jambonz-api-server project that you cloned from github, then run the following command to start the back-end processes.

```bash
cd jambonz-api-server
npm run integration-test
```

This will take a few minutes to start, but a successfull startup will eventually look like this:
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

This will start the a docker-compose network with the following containers:
- mysql
- redis
- influxdb
- heplify-server
- drachtio
- homer-webapp

Leaving jambonz-api-server running, open another terminal window, cd into the folder where you have checked out this project, and start it as shown below:

```
cd jambonz-webapp
npm start
```
This will start the react UI and open a browser page to http://localhost:3001.

You will now see the login page to the jambonz webapp and can log in with username admin and password admin.  You will be forced to change the password, and then you should see the main page of the application.

From here you can make and test changes locally.
