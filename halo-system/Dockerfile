FROM node:18-alpine

# MSP System Backend + Frontend Server
# Context: root directory (docker-compose uses context: .)
# This Dockerfile serves both the API backend and frontend static files

WORKDIR /halo-system

# Copy both backend and frontend directories
COPY halo-system/backend/ ./backend/
COPY halo-system/frontend/ ./frontend/

# Install backend dependencies
WORKDIR /halo-system/backend
RUN npm install --production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-3000}/api/health || exit 1

ENV PORT=3000
EXPOSE 3000

# Run from backend directory
CMD ["npm", "start"]
