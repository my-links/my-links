# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:20-alpine3.18 as base

RUN apk --no-cache add curl
RUN corepack enable

# All deps stage
FROM base as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
COPY .adonisjs /app/.adonisjs
RUN pnpm install --ignore-scripts

# Production only deps stage
FROM base as production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml /app/
COPY .adonisjs /app/.adonisjs
RUN pnpm install --ignore-scripts --prod

# Build stage
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . /app
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=production-deps /app/.adonisjs /app/.adonisjs
COPY --from=build /app/build /app

# Expose port
EXPOSE $PORT

# Start app
CMD node bin/console.js migration:run --force && node bin/server.js

