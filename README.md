# Jambonz Web Application

## Deploy to Production

  1. Install `pm2` globally on the server hosting this application.
  2. Copy `.env` to `.env.local`
  3. In `.env.local`, replace `[ip]:[port]` with the API's IP and port
  4. Run `npm run deploy`
  5. Access the web app via port 3001

NOTE: Here is what `npm run deploy` does:

  - Install all dependencies (`npm i`)
  - Build the production React application (`npm run build`)
  - Launch the app with pm2 (`pm2 start npm --name "jambonz-webapp" -- run serve`)

Alternatively, you can serve the app manually (without pm2) with `npm run serve`.

## Updates

If there is an update to this code base, you can update the code without re-deploying.

  1. run `git pull`
  2. run `npm run build`

## Development

Like production, you must specify the IP:port of the Jambonz API you will be hitting.

  1. Copy `.env` to `.env.local`
  2. In `.env.local`, replace `[ip]:[port]` with the API's IP and port
  3. `npm start`
  4. Access the web app via http://localhost:3001
