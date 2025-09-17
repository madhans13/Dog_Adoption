FROM node:20-alpine
WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user first
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code with correct ownership
COPY --chown=backend:nodejs . .

# Create uploads directory (owned by backend)
RUN mkdir -p /app/uploads && chown -R backend:nodejs /app/uploads


# Switch to non-root user
USER backend

# Set port environment variable
ENV PORT=5000
EXPOSE 5000

# Start the Express backend application
CMD ["node", "backend/src/server.js"]
