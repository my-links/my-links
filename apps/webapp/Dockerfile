# Source : https://github.com/adonisjs-community/adonis-packages/blob/main/Dockerfile

FROM node:24.14-alpine3.22 AS base

RUN apk --no-cache add curl && corepack enable

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

# Supercronic runs the account maintenance crontab in the scheduler service
# (see compose.yml). It logs to stdout and needs no root/mail setup, unlike
# a system cron daemon.
ARG SUPERCRONIC_VERSION=v0.2.49
ARG SUPERCRONIC_SHA1SUM=e63c11a9726b775a6a11801e81af4f3fb926aa68
RUN curl -fsSLo /usr/local/bin/supercronic \
		"https://github.com/aptible/supercronic/releases/download/${SUPERCRONIC_VERSION}/supercronic-linux-amd64" \
	&& echo "${SUPERCRONIC_SHA1SUM}  /usr/local/bin/supercronic" | sha1sum -c - \
	&& chmod +x /usr/local/bin/supercronic

WORKDIR /app
COPY --from=build /app/apps/webapp/build /app
COPY --from=build /app/apps/webapp/scripts/entrypoint.sh /app/scripts/entrypoint.sh
COPY --from=build /app/apps/webapp/crontab /app/crontab
COPY --from=build /deploy/node_modules /app/node_modules
RUN chmod +x /app/scripts/entrypoint.sh

EXPOSE $PORT

CMD ["/app/scripts/entrypoint.sh"]
