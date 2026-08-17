# Development image for the Express/Node.js backend
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source (overridden by bind mounts in docker-compose)
COPY . .

EXPOSE 5000

# nodemon for live reload; --legacy-watch helps on Docker Desktop (esp. Windows/macOS)
CMD ["npx", "nodemon", "--legacy-watch", "src/index.js"]
