# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

# Keep in sync with the pnpm version in mise.toml
FROM ghcr.io/pnpm/pnpm:12.15.0-alpine AS pnpm

# Keep in sync with the node version in mise.toml
FROM node:26.12.1-alpine3.24 AS base

# Standalone pnpm binary, only needed to install and build
FROM base AS pnpm-base
COPY --from=pnpm /opt/pnpm /opt/pnpm
RUN ln -s /opt/pnpm/pnpm /usr/local/bin/pnpm

# All deps stage
FROM pnpm-base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
RUN pnpm install --ignore-scripts --frozen-lockfile

# Build stage
FROM pnpm-base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=deps /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY . .
RUN pnpm install --ignore-scripts --frozen-lockfile

WORKDIR /app/apps/webapp
RUN pnpm run compile
RUN node ace build

WORKDIR /app
# Deploy creates a self-contained node_modules with all prod deps resolved,
# including workspace packages bundled with their built output.
RUN pnpm --filter @my-links/webapp deploy --prod --ignore-scripts --legacy /deploy

# Production stage
FROM base AS production

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV CACHE_VIEWS=false
ENV PORT=3333

WORKDIR /app
COPY --from=build /app/apps/webapp/build /app
COPY --from=build /app/apps/webapp/scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY --from=build /deploy/node_modules /app/node_modules
RUN chmod +x /app/scripts/entrypoint.sh
RUN mkdir -p /app/storage/favicons

EXPOSE 3333

CMD ["/app/scripts/entrypoint.sh"]
