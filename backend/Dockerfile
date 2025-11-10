# Use lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Install all dependencies inside container
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy all source code
COPY . .

# Set environment variable for port
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Run the backend
CMD ["npm", "start"]
