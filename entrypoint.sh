#!/bin/sh
PUBLIC_IPV4="$(curl --fail -qs whatismyip.akamai.com)"
API_PORT="${API_PORT:-3000}"
API_VERSION="${API_VERSION:-v1}"
REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL:-http://$PUBLIC_IPV4:$API_PORT/$API_VERSION}
echo "REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}" > /opt/app/.env
cd /opt/app/
TAG="<script>window.JAMBONZ = { APP_API_BASE_URL: '${REACT_APP_API_BASE_URL}'};</script>"
sed -i -e "\@</head>@i\    $TAG" ./build/index.html
npm run serve