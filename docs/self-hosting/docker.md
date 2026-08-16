# Docker & compose

## Prerequisites

- **Docker** and **Docker Compose**
- A `.env` file configured with all required environment variables — see [Configuration](/self-hosting/configuration)

## 1. Create a directory for your deployment

```bash
mkdir my-links-deployment
cd my-links-deployment
```

## 2. Create a `docker-compose.yml`

```yaml
name: my-links
services:
  postgres:
    container_name: postgres
    image: postgres:18
    restart: always
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready', '-U', '${DB_USER}']
    volumes:
      - postgres-volume:/var/lib/postgresql
    ports:
      - '${DB_PORT}:5432'

  my-links:
    container_name: my-links
    image: sonny93/my-links:latest
    restart: always
    environment:
      - DB_HOST=postgres
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
  postgres-volume:
```

## 3. Create your `.env`

Use [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example) from the repository as a template, and see [Configuration](/self-hosting/configuration) for what each variable does. It sits next to your `docker-compose.yml`, at the root of your deployment directory.

## 4. Start it

```bash
docker compose up -d
```

This pulls the image from [Docker Hub](https://hub.docker.com/r/sonny93/my-links), starts PostgreSQL, applies database migrations automatically, and starts the application in production mode — reachable on the port set in `PORT` (default `3333`). Account maintenance runs alongside it in the same container, flagging inactive accounts and deleting expired ones once their grace period runs out — no separate setup needed.

## Native deployment

If you would rather run it without Docker:

1. **Node.js** 24.14.0 (or compatible), **pnpm**, and **PostgreSQL 18** installed and running.

2. Clone and install:

   ```bash
   git clone https://github.com/my-links/my-links.git
   cd my-links
   pnpm install
   ```

3. Copy `.env.example` to `.env` and configure it. Native runs expect it inside `apps/webapp`, unlike the Docker path above:

   ```bash
   cp .env.example apps/webapp/.env
   ```

4. Point `DB_*` at your PostgreSQL instance, then apply migrations (every `node ace` command runs from `apps/webapp`):

   ```bash
   cd apps/webapp
   node ace migration:run
   ```

5. Compile the translation catalogs and build:

   ```bash
   pnpm run compile
   node ace build
   ```

6. Copy `.env` into the build output and start it:

   ```bash
   cp .env build/
   cd build
   pnpm run start
   ```

The application is reachable on the port set in `PORT`.

Account maintenance (flagging inactive accounts, deleting expired ones) is not automatic here — the Docker path gets it for free, scheduled inside the application itself, but a native deployment needs its own system cron calling, from `build/`:

```bash
node bin/console.js account:flag-inactive
node bin/console.js account:prune-deleted
```
