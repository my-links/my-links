# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:22.14-alpine3.20 AS base

RUN apk --no-cache add curl
RUN corepack enable

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts --prod

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .

ENV PORT=3333
ENV HOST=localhost
ENV LOG_LEVEL=info
ENV APP_KEY=sLoJth45JD1vcS8n92Y2JUd8w3OL4HQb
ENV NODE_ENV=production
ENV SESSION_DRIVER=cookie
ENV DB_HOST=127.0.0.1
ENV DB_PORT=5432
ENV DB_USER=db_user
ENV DB_PASSWORD=db_password
ENV DB_DATABASE=db_db
ENV GOOGLE_CLIENT_ID=client_id
ENV GOOGLE_CLIENT_SECRET=client_secret
ENV GOOGLE_CLIENT_CALLBACK_URL=http://localhost:3333/auth/callback

RUN node ace izzy:routes
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

# Expose port
EXPOSE $PORT

# Start app
CMD node bin/console.js migration:run --force && node bin/server.js
