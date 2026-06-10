FROM node:20-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@8

# Copy whole repository (monorepo) so workspace:* packages resolve
COPY . /usr/src/app

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod || true

# Expose port (the app listens on PORT env)
EXPOSE 8080

# Default command: run built server
CMD ["node", "./dist/index.mjs"]
