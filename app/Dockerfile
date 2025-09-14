# Build Stage
FROM node:20-slim AS build-stage
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

COPY --from=build-stage /app/build ./build
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# Set custom port for react-router-serve
ENV PORT=8080

EXPOSE 8080
CMD ["npx", "react-router-serve", "./build/server/index.js", "--port", "8080"]
