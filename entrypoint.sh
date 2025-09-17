#!/bin/sh

# Check if RUNTIME_API_BASE_URL is set, else use default
: "${RUNTIME_API_BASE_URL:=http://dog-adoption-backend:5000}"

echo "Setting runtime API URL to $RUNTIME_API_BASE_URL"

# Write a small config JS that the frontend reads
cat <<EOF > ./build/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "$RUNTIME_API_BASE_URL"
};
EOF

# Start the server
exec npx react-router-serve ./build/server/index.js --port $PORT
