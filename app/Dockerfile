FROM node:20-slim AS build-stage
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app

# Copy the built application
COPY --from=build-stage /app/build ./build
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/node_modules ./node_modules

# Copy runtime entrypoint script
COPY app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

# Run entrypoint script (injects config + starts server)
ENTRYPOINT ["/entrypoint.sh"]
