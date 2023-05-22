#!/bin/sh

# This is where the frontend dist is located
cd /opt/app/

# Build the backend API URL for frontend web app
PUBLIC_IPV4="$(curl --fail -qs whatismyip.akamai.com)"
API_PORT="${API_PORT:-3000}"
API_VERSION="${API_VERSION:-v1}"
API_BASE_URL=${API_BASE_URL:-http://$PUBLIC_IPV4:$API_PORT/$API_VERSION}

# Default to "false" if not set
DISABLE_LCR=${DISABLE_LCR:-false}
DISABLE_JAEGER_TRACING=${DISABLE_JAEGER_TRACING:-false}
DISABLE_CUSTOM_SPEECH=${DISABLE_CUSTOM_SPEECH:-false}
ENABLE_FORGOT_PASSWORD=${ENABLE_FORGOT_PASSWORD:-false}

# Serialize window global to provide the API URL to static frontend dist
# This is declared and utilized in the web app: src/api/constants.ts
SCRIPT_TAG="<script>window.JAMBONZ = {
    API_BASE_URL: \"${API_BASE_URL}\",
    DISABLE_LCR: \"${DISABLE_LCR}\",
    DISABLE_JAEGER_TRACING: \"${DISABLE_JAEGER_TRACING}\",
    DISABLE_CUSTOM_SPEECH: \"${DISABLE_CUSTOM_SPEECH}\",
    ENABLE_FORGOT_PASSWORD: \"${ENABLE_FORGOT_PASSWORD}\"
  };</script>"
sed -i -e "\@</head>@i\    $SCRIPT_TAG" ./dist/index.html

# Start the frontend web app static server
npm run serve
