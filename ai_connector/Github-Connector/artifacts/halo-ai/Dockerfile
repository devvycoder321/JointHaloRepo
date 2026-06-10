FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@8
COPY . /app
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
