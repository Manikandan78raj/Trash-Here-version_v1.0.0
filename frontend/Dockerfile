# Multi-stage build for React/Vite Frontend Application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and workspace package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies across workspaces
RUN npm ci

# Copy frontend source code
COPY frontend/ ./frontend/

# Build Vite SPA production bundle
WORKDIR /app/frontend
RUN npm run build

# Production runtime stage with Nginx
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy built SPA static files from builder stage
COPY --from=builder /app/frontend/dist ./

# Copy custom production Nginx configuration with API proxying & security headers
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx server in foreground
CMD ["nginx", "-g", "daemon off;"]
