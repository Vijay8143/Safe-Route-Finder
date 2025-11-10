# build stage
FROM node:18-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

# serve stage
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
