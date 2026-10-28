# Docker & compose

## Prerequisites

- **Docker** and **Docker Compose**

## 1. Create a directory for your deployment

```bash
mkdir my-links-deployment
cd my-links-deployment
```

## 2. Download the compose file and the environment template

```bash
curl -fsSLO https://raw.githubusercontent.com/my-links/my-links/main/compose.image.yml
curl -fsSL https://raw.githubusercontent.com/my-links/my-links/main/.env.example -o .env
```

[`compose.image.yml`](https://github.com/my-links/my-links/blob/main/compose.image.yml) runs the published image next to a PostgreSQL container, and reads its settings from the `.env` next to it.

The PostgreSQL port is bound to `127.0.0.1` on purpose: the database is reachable from the host itself, never from the network. The application reaches it over the compose network and always uses port `5432` there, whatever `DB_PORT` is.

`favicon-volume` holds the cached favicon images (see [Configuration](/self-hosting/configuration#favicon-store)). Unlike `postgres-volume`, losing it isn't a data loss (the app re-downloads what it needs), but keeping it out of your backup strategy means a restore re-fetches every favicon from scratch instead of serving them immediately.

`/app/storage/favicons` must be a persistent volume. `compose.image.yml` already declares it, but platforms that build only the Dockerfile (Dokploy in "Application" mode, Coolify, a plain `docker run`) do not read it: add the mount yourself, for example `-v favicon-volume:/app/storage/favicons`. Without it, every redeploy wipes the stored icons while their database rows survive. The app re-downloads a missing icon the next time it is requested, but until then each affected link shows its placeholder.

`x-logging` caps what Docker keeps of each container's output at three 10 MB files, the oldest dropped first. Docker's default keeps everything for as long as the container exists. Platforms that do not read the compose file need the same limit set on their side, for example `--log-opt max-size=10m --log-opt max-file=3` on `docker run`. See [Logging](/self-hosting/configuration#logging) for what the log contains.

## 3. Edit your `.env`

The `.env` you downloaded is the template. Set at least `APP_KEY`, `APP_URL`, `DB_USER`, `DB_PASSWORD` and `DB_DATABASE`; see [Configuration](/self-hosting/configuration) for what each variable does.

Sign-up is closed by default: only the setup link printed in the logs on first boot can create the first account, and `/register` closes once it exists. To let anyone register, set `ALLOW_REGISTRATION=open`, see [Registration](/self-hosting/configuration#registration).

## 4. Start it

```bash
docker compose -f compose.image.yml up -d
```

This pulls the image from [Docker Hub](https://hub.docker.com/r/sonny93/my-links), starts PostgreSQL, applies database migrations automatically, and starts the application in production mode, reachable on the port set in `PORT` (default `3333`). Account maintenance runs alongside it in the same container with no separate setup, see [Maintenance](/self-hosting/console-commands#maintenance).

## 5. Create the first administrator

While no administrator exists, the logs print a setup link. Open it and register, the form carries the token for you:

```bash
docker compose -f compose.image.yml logs my-links | grep setup_token
```

The link is `<APP_URL>/register?setup_token=<token>`. See [First administrator](/self-hosting/authentication#first-administrator).

## Native deployment

If you would rather run it without Docker:

1. **Node.js**, **pnpm** and **PostgreSQL 18** installed and running. The Node.js and pnpm versions are pinned in [`mise.toml`](https://github.com/my-links/my-links/blob/main/mise.toml), and `mise install` sets them up.

2. Clone and install:

   ```bash
   git clone https://github.com/my-links/my-links.git
   cd my-links
   pnpm install
   ```

3. Copy `.env.example` to `.env` at the repository root and configure it:

   ```bash
   cp .env.example .env
   ```

4. Point `DB_*` at your PostgreSQL instance, then apply migrations. Every `node ace` command runs from `apps/webapp` with `ENV_PATH=../..`, see [Configuration](/self-hosting/configuration):

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

Account maintenance and the other sweeps are scheduled inside the application itself, on Docker and on a native `pnpm run start` alike. A system cron is only needed if you disable the scheduler preload or run the application without the web process, see [Maintenance](/self-hosting/console-commands#maintenance) for the commands to run from `build/`.
