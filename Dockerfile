# Dockerfile - Simplified multi-stage build
FROM node:22.19.0-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies
RUN npm install && \
    cd frontend && npm install && \
    cd ../backend && npm install

# Copy source code
COPY . .

# Build applications
RUN cd frontend && npm run build
RUN cd backend && npm run build

# Production stage
FROM node:22.19.0-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install dumb-init
RUN apk add --no-cache dumb-init

# Environment variables
ENV NODE_ENV=production
ENV PORT=4200

# Copy only necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/frontend/next.config.ts ./frontend/
COPY --from=builder --chown=nextjs:nodejs /app/frontend/tsconfig.json ./frontend/

USER nextjs
EXPOSE 4200
CMD ["dumb-init", "node", "backend/dist/app.js"]