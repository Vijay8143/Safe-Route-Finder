# Use lightweight Node image
FROM node:18-alpine

# Install build dependencies for native modules (sqlite3) + py3-setuptools for distutils
RUN apk add --no-cache python3 py3-setuptools make g++

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Install all dependencies inside container
RUN npm install --production

# Ensure sqlite3 native addon is built for linux (now distutils is available)
RUN npm rebuild sqlite3 --build-from-source

# Copy all source code
COPY . .

# Set environment variable for port
ENV PORT=5000
ENV NODE_ENV=production

# Expose backend port
EXPOSE 5000

# Run the backend
CMD ["node", "server.js"]
