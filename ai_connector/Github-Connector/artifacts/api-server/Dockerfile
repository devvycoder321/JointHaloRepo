FROM node:20-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@10

# Copy whole repository (monorepo) so workspace:* packages resolve
COPY . /usr/src/app

# Install only the API server workspace dependencies and build the server
RUN pnpm install --frozen-lockfile --filter @workspace/api-server...
RUN pnpm --filter @workspace/api-server run build

# Expose port (the app listens on PORT env)
EXPOSE 8080

# Run from the API server workspace
WORKDIR /usr/src/app/artifacts/api-server

# Default command: run built server
CMD ["node", "./dist/index.mjs"]
