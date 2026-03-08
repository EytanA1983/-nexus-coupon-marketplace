# Multi-stage build for production-ready frontend
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source and config
COPY package.json ./
COPY tsconfig.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public

# Build application (VITE_API_BASE_URL is set at build time via ARG)
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
