# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:24.13-alpine3.22 AS base

RUN apk --no-cache add curl && corepack enable

# All deps stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/my-links/package.json apps/my-links/package.json
COPY apps/extension/package.json apps/extension/package.json
RUN pnpm install --ignore-scripts

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/my-links/package.json apps/my-links/package.json
COPY apps/extension/package.json apps/extension/package.json
RUN pnpm install --ignore-scripts --prod

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/my-links/node_modules /app/apps/my-links/node_modules
COPY . .

RUN pnpm --filter my-links run compile
RUN pnpm --filter my-links run build

# Production stage
FROM base

ENV NODE_ENV=production
ENV LOG_LEVEL=debug
ENV CACHE_VIEWS=false
ENV SESSION_DRIVER=cookie
ENV PORT=$PORT

WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=production-deps /app/apps/my-links/node_modules /app/apps/my-links/node_modules
COPY --from=build /app/apps/my-links/build /app/apps/my-links
COPY --from=build /app/apps/my-links/.adonisjs /app/apps/my-links/.adonisjs
COPY --from=build /app/apps/my-links/package.json /app/apps/my-links/package.json

# Expose port
EXPOSE $PORT

# Start app

WORKDIR /app/apps/my-links
COPY apps/my-links/scripts/entrypoint.sh /app/apps/my-links/scripts/entrypoint.sh
RUN chmod +x /app/apps/my-links/scripts/entrypoint.sh

CMD ["/app/apps/my-links/scripts/entrypoint.sh"]
