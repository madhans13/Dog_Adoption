# Build Stage
FROM node:20-slim AS build-stage
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build the frontend normally; we inject a small runtime config file instead of bake-time env
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

COPY --from=build-stage /app/build ./build
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Set default port
ENV PORT=8080
EXPOSE 8080

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
