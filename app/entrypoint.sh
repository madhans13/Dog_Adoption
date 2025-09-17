#!/bin/sh

# Check if RUNTIME_API_BASE_URL is set, else use default
: "${RUNTIME_API_BASE_URL:=http://dog-adoption-backend:5000}"

echo "Setting runtime API URL to $RUNTIME_API_BASE_URL"

# Write a small config JS that the frontend reads (place in client dir so it's served statically)
cat <<EOF > ./build/client/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "$RUNTIME_API_BASE_URL"
};
EOF

# Ensure the client HTML loads the runtime config early
if [ -f ./build/client/index.html ]; then
  if ! grep -q "/config.js" ./build/client/index.html; then
    # Insert the script tag before the closing </head>
    sed -i 's#</head>#  <script src="/config.js"></script>\n</head>#' ./build/client/index.html
  fi
fi

# Start the server
exec npx react-router-serve ./build/server/index.js --port $PORT
