# Recommended multi-stage Dockerfile for typical React apps (adjust build dir if different)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Retry logic (2 attempts) + ignore engines if necessary
RUN set -eux; \
    npm install --legacy-peer-deps || npm install --legacy-peer-deps --ignore-engines
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the production assets. Pass REACT_APP_API_URL as a build-arg from CI if needed.
RUN npm run build

FROM nginx:alpine AS runtime
# copy build output; adjust '/app/build' if your build dir differs
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
