# Node.js Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app/backend

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json ./


# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001

# Change ownership
RUN chown -R backend:nodejs /app/backend
USER backend

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Start command
CMD ["node", "server.js"]