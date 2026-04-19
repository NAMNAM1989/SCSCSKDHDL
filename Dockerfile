# Next.js static export → nginx
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache jq
COPY docker-entrypoint.d/40-sync-config.sh /docker-entrypoint.d/40-sync-config.sh
RUN chmod +x /docker-entrypoint.d/40-sync-config.sh
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 8080
