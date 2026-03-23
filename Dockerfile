# Use the official Puppeteer Docker image which has Chrome and all dependencies
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Set working directory
WORKDIR /app

# Switch to root to fix directory permissions if needed
USER root

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
# We use --omit=dev to keep it light
RUN npm install --omit=dev

# Copy the rest of the code
COPY . .

# Set permissions for cache file (if any)
RUN touch cache.json && chmod 666 cache.json

# Use the non-root user provided by the base image
USER pptruser

# Expose the API port
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
