#!/bin/sh
PUBLIC_IPV4="$(curl --fail -qs whatismyip.akamai.com)"
API_PORT="${API_PORT:-3000}"
API_VERSION="${API_VERSION:-v1}"
echo "REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL:-http://$PUBLIC_IPV4:$API_PORT/$API_VERSION}" > /opt/app/.env
cd /opt/app/
npm run serve