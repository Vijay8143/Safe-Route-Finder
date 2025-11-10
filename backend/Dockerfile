FROM node:18-alpine

WORKDIR /usr/src/app

# copy package files and install production deps
COPY backend/package*.json ./
RUN npm ci --only=production

# copy app source
COPY backend/ .

ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
