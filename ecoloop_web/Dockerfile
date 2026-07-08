# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for caching optimization
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
COPY public/ ./public/

# Build production artifact
RUN npm run build

# Stage 2: Host the static files using Nginx
FROM nginx:alpine

# Copy built files to Nginx static content folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
