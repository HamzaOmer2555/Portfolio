# ============================================
# Multi-stage build for optimal image size
# ============================================

# Stage 1: Build stage (if needed for future enhancements)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy source files
COPY . .

# No build step needed for static files, but this stage
# can be extended for future minification/optimization

# ============================================
# Stage 2: Production stage
# ============================================
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website files from builder stage
COPY --from=builder /app /usr/share/nginx/html

# Set proper permissions
RUN chmod -R 755 /usr/share/nginx/html

# Nginx user (nginx:101) already exists in nginx:alpine image
# Run as root for simplicity, or uncomment to use non-root:
# USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/index.html || exit 1

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
