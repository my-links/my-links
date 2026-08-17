# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:24.14-alpine3.22 AS base

RUN corepack enable

# All deps stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
RUN pnpm install --ignore-scripts --frozen-lockfile

# Build stage
FROM base AS build
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
ENV LOG_LEVEL=debug
ENV CACHE_VIEWS=false
ENV PORT=$PORT

WORKDIR /app
COPY --from=build /app/apps/webapp/build /app
COPY --from=build /app/apps/webapp/scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY --from=build /deploy/node_modules /app/node_modules
RUN chmod +x /app/scripts/entrypoint.sh
RUN mkdir -p /app/storage/favicons

EXPOSE $PORT

CMD ["/app/scripts/entrypoint.sh"]
