# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:24.13-alpine3.22 AS base

RUN apk --no-cache add curl
RUN corepack enable

# All deps stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts --prod

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .

RUN pnpm run compile
RUN node ace build

# Production stage
FROM base

ENV NODE_ENV=production
ENV LOG_LEVEL=debug
ENV CACHE_VIEWS=false
ENV SESSION_DRIVER=cookie
ENV PORT=$PORT

WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
COPY --from=build /app/.adonisjs /app/.adonisjs
COPY --from=build /app/package.json /app/package.json

# Expose port
EXPOSE $PORT

# Start app
CMD node bin/console.js migration:run --force && node bin/server.js
