# React Frontend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app/frontend

# Install system dependencies
RUN apk add --no-cache \
    bash \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json ./


# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001

# Change ownership
RUN chown -R frontend:nodejs /app/frontend
USER frontend

# Expose port
EXPOSE 3000

# Start command
CMD ["yarn", "start"]