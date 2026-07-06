# Multi-stage build for NestJS Backend API
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root and workspace package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies across workspaces
RUN npm ci

# Copy backend source code and Prisma schema
COPY backend/ ./backend/

# Generate Prisma Client & Build API bundle
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy root and backend package manifests
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts and Prisma client from builder stage
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/package*.json ./backend/

WORKDIR /app/backend
EXPOSE 3000

# Start NestJS production server
CMD ["node", "dist/main"]
