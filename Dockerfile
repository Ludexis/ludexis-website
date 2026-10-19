# The site is static, so it is built once on the runner's own platform and copied into each image.
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
# Where links to the Ludexis app are redirected; empty turns the redirects off.
ENV APP_URL=""
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
