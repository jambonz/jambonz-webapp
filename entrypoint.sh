#!/bin/sh

# This is where the frontend dist is located
cd /opt/app/

# Build the backend API URL for frontend web app
PUBLIC_IPV4="$(curl --fail -qs whatismyip.akamai.com)"
API_PORT="${API_PORT:-3000}"
API_VERSION="${API_VERSION:-v1}"
API_BASE_URL=${API_BASE_URL:-http://$PUBLIC_IPV4:$API_PORT/$API_VERSION}

# Serialize window global to provide the API URL to static frontend dist
# This is declared and utilized in the web app: src/api/constants.ts
SCRIPT_TAG="<script>window.JAMBONZ = { API_BASE_URL: \"${API_BASE_URL}\" };</script>"
sed -i -e "\@</head>@i\    $SCRIPT_TAG" ./dist/index.html

# Start the frontend web app static server
npm run serve
