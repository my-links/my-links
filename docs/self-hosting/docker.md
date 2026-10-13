# Docker & compose

## Prerequisites

- **Docker** and **Docker Compose**
- A `.env` file configured with all required environment variables, see [Configuration](/self-hosting/configuration)

## 1. Create a directory for your deployment

```bash
mkdir my-links-deployment
cd my-links-deployment
```

## 2. Create a `docker-compose.yml`

```yaml
name: my-links
# Docker keeps container output forever by default: cap it so old log lines age out.
x-logging: &default-logging
  driver: json-file
  options:
    max-size: 10m
    max-file: '3'

services:
  postgres:
    restart: always
    logging: *default-logging
    image: postgres:18
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test:
        ['CMD-SHELL', 'pg_isready', '-U', '${DB_USER}', '-d', '${DB_DATABASE}']
      interval: 30s
      timeout: 5s
      retries: 10
      start_period: 10s
      start_interval: 500ms
    volumes:
      - postgres-volume:/var/lib/postgresql
    ports:
      - '127.0.0.1:${DB_PORT}:5432'

  my-links:
    container_name: my-links
    restart: always
    logging: *default-logging
    image: sonny93/my-links:latest
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - HOST=0.0.0.0
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - ${PORT}:3333
    volumes:
      - favicon-volume:/app/storage/favicons

volumes:
  postgres-volume:
  favicon-volume:
```

The PostgreSQL port is bound to `127.0.0.1` on purpose: the database is reachable from the host itself, never from the network. The application reaches it over the compose network and always uses port `5432` there, whatever `DB_PORT` is.

`favicon-volume` holds the cached favicon images (see [Configuration](/self-hosting/configuration#favicon-store)). Unlike `postgres-volume`, losing it isn't a data loss (the app re-downloads what it needs), but keeping it out of your backup strategy means a restore re-fetches every favicon from scratch instead of serving them immediately.

`/app/storage/favicons` must be a persistent volume. The compose file above already declares it, but platforms that build only the Dockerfile (Dokploy in "Application" mode, Coolify, a plain `docker run`) do not read it: add the mount yourself, for example `-v favicon-volume:/app/storage/favicons`. Without it, every redeploy wipes the stored icons while their database rows survive. The app re-downloads a missing icon the next time it is requested, but until then each affected link shows its placeholder.

`x-logging` caps what Docker keeps of each container's output at three 10 MB files, the oldest dropped first. Docker's default keeps everything for as long as the container exists. Platforms that do not read the compose file need the same limit set on their side, for example `--log-opt max-size=10m --log-opt max-file=3` on `docker run`. See [Logging](/self-hosting/configuration#logging) for what the log contains.

## 3. Create your `.env`

Use [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example) from the repository as a template, and see [Configuration](/self-hosting/configuration) for what each variable does. It sits next to your `docker-compose.yml`, at the root of your deployment directory.

## 4. Start it

```bash
docker compose up -d
```

This pulls the image from [Docker Hub](https://hub.docker.com/r/sonny93/my-links), starts PostgreSQL, applies database migrations automatically, and starts the application in production mode, reachable on the port set in `PORT` (default `3333`). Account maintenance runs alongside it in the same container, flagging inactive accounts, deleting expired ones once their grace period runs out, purging orphaned favicons and pruning old activity journal rows, with no separate setup needed.

## Native deployment

If you would rather run it without Docker:

1. **Node.js** 24.14.0 (or compatible), **pnpm**, and **PostgreSQL 18** installed and running.

2. Clone and install:

   ```bash
   git clone https://github.com/my-links/my-links.git
   cd my-links
   pnpm install
   ```

3. Copy `.env.example` to `.env` at the repository root and configure it, the same file Docker Compose and the `Justfile` read:

   ```bash
   cp .env.example .env
   ```

4. Point `DB_*` at your PostgreSQL instance, then apply migrations. Every `node ace` command runs from `apps/webapp`, and `ENV_PATH=../..` tells AdonisJS to read the root `.env` instead of looking for `apps/webapp/.env`:

   ```bash
   cd apps/webapp
   ENV_PATH=../.. node ace migration:run
   ```

5. Compile the translation catalogs and build:

   ```bash
   ENV_PATH=../.. pnpm run compile
   ENV_PATH=../.. node ace build
   ```

6. Install the production dependencies next to the build output. From the repository root, this resolves a self-contained `node_modules` in a temporary directory (the same way the Docker image does) and copies it into `build/`:

   ```bash
   cd ../..
   pnpm --filter @my-links/webapp deploy --prod --ignore-scripts --legacy /tmp/my-links-deploy
   cp -r /tmp/my-links-deploy/node_modules apps/webapp/build/
   ```

7. Copy the root `.env` into the build output (the built app reads `build/.env`, not the root one) and start it:

   ```bash
   cp .env apps/webapp/build/
   cd apps/webapp/build
   pnpm run start
   ```

The application is reachable on the port set in `PORT`.

Account maintenance (flagging inactive accounts, deleting expired ones), the favicon store's orphan purge and the activity journal pruning are not automatic here: the Docker path gets them for free, scheduled inside the application itself, but a native deployment needs its own system cron calling, from `build/` (see [Console commands](/self-hosting/console-commands#maintenance)):

```bash
node bin/console.js account:flag-inactive
node bin/console.js account:prune-deleted
node bin/console.js favicon:purge-orphans
node bin/console.js activity:prune
```
