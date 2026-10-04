# syntax=docker/dockerfile:1.7
# Multi-stage build: compile with Node, serve the static bundle with nginx.

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
LABEL org.opencontainers.image.title="TSVerseHub" \
      org.opencontainers.image.source="https://github.com/SatvikPraveen/TSVerseHub" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="Satvik Praveen <satvikpraveen707@gmail.com>"
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
