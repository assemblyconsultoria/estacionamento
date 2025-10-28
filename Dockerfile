# Multi-stage build for Full Stack Application (Frontend + Backend)
# This Dockerfile builds both Angular frontend and Node.js backend in a single container

# ============================================
# Stage 1: Build Backend Dependencies
# ============================================
FROM node:20-alpine AS backend-deps

WORKDIR /backend

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# ============================================
# Stage 2: Build Angular Frontend
# ============================================
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source code
COPY . .

# Build the Angular application for production
RUN npm run build -- --configuration production

# ============================================
# Stage 3: Final Image - Node.js + Nginx + Supervisord
# ============================================
FROM node:20-alpine

# Install nginx and supervisord
RUN apk add --no-cache nginx supervisor wget

# Create necessary directories
RUN mkdir -p /var/log/supervisor \
    /run/nginx \
    /backend \
    /frontend

# ============================================
# Setup Backend
# ============================================
WORKDIR /backend

# Copy backend dependencies from stage 1
COPY --from=backend-deps /backend/node_modules ./node_modules

# Copy backend source code
COPY backend/package*.json ./
COPY backend/src ./src

# ============================================
# Setup Frontend (Nginx)
# ============================================

# Copy built frontend from stage 2
COPY --from=frontend-build /app/dist/parking-app/browser /frontend

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# ============================================
# Setup Supervisord
# ============================================

# Copy supervisord configuration
COPY supervisord.conf /etc/supervisord.conf

# Create non-root user for better security
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /backend /frontend /var/log/supervisor /var/lib/nginx /var/log/nginx

# Expose ports
EXPOSE 3000 3000

# Health check - check both frontend and backend
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ && \
      wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start supervisord (manages both nginx and node)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
