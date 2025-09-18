#!/bin/sh

# Set default API URL if not provided
: "${RUNTIME_API_BASE_URL:=http://dog-adoption-backend:5000}"
echo "Setting runtime API URL to $RUNTIME_API_BASE_URL"

# Create a config.js file that will be served by the React Router server
mkdir -p /app/build/client
cat <<EOF > /app/build/client/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "$RUNTIME_API_BASE_URL"
};
EOF

echo "Runtime configuration created successfully"
echo "Starting React Router server..."

# Set PORT environment variable and start the React Router server
export PORT=8080
exec npx react-router-serve ./build/server/index.js