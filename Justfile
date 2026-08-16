webapp_path := "apps/webapp"
webapp_env_file := ".env"

# .env lives at the repo root (Dokploy's compose mode only manages a root
# .env, not nested paths); AdonisJS's own loader defaults to apps/webapp, so
# point it one level up for every native `node ace` invocation below.
export ENV_PATH := "../.."

compose_env := "--env-file " + webapp_env_file
compose_dev := "-f dev.compose.yml " + compose_env
compose_build := "-f compose.yml " + compose_env
compose_image := "-f compose.image.yml " + compose_env

alias dw := docker-weight

tuyau:
	@cd {{ webapp_path }} && node ace tuyau:generate
	@pnpm run format

docs:
	@pnpm exec vitepress dev docs --host 0.0.0.0

docs-preview:
	@pnpm run docs:build
	@pnpm exec vitepress preview docs --host 0.0.0.0

extract:
	@cd {{ webapp_path }} && pnpm run extract

compile:
	@cd {{ webapp_path }} && pnpm run compile

format:
	@pnpm run format

update:
	@npx --yes npm-check-updates --format group --interactive -p pnpm --workspaces
	@pnpm install

_dev: _drop-stale-assets
	@docker compose {{ compose_build }} down
	@docker compose {{ compose_dev }} pull
	@docker compose {{ compose_dev }} up -d --wait --remove-orphans
	@cd {{ webapp_path }} && node ace migration:fresh
dev: _dev
	@cd {{ webapp_path }} && node ace db:seed
	@pnpm run dev:webapp

# Builds my-links/scheduler from the local Dockerfile.
prod:
	@docker compose {{ compose_dev }} down
	@docker compose {{ compose_build }} pull --ignore-buildable
	@docker compose {{ compose_build }} up -d --build --wait --remove-orphans

# Runs my-links/scheduler from the published sonny93/my-links image instead of building.
prod-pull:
	@docker compose {{ compose_dev }} down
	@docker compose {{ compose_image }} pull
	@docker compose {{ compose_image }} up -d --wait --remove-orphans

# A leftover public/assets makes the app read a production manifest and fail
_drop-stale-assets:
	@rm -rf {{ webapp_path }}/public/assets

# unit and functional share one boot: no DB/port/env conflict between them.
# browser stays separate: it sets SMTP_HOST for mailpit, which functional's
# "without outgoing mail" tests rely on being unset.
test-unit-functional: _drop-stale-assets
	@cd {{ webapp_path }} && node ace test unit functional --no-clear

test-e2e: _drop-stale-assets
	@cd {{ webapp_path }} && pnpm run test:browser

test: _dev test-unit-functional test-e2e

# Build the image cd.yml ships, so a broken Dockerfile fails before the tag and the release exist
build-image:
	@docker build -f {{ webapp_path }}/Dockerfile -t my-links:release-check .

seed:
	@cd {{ webapp_path }} && node ace db:seed

fresh:
	@cd {{ webapp_path }} && node ace migration:fresh

down:
	@-docker compose {{ compose_build }} down
	@-docker compose {{ compose_dev }} down

release:
	@pnpm run release:webapp

docker-weight:
	@sh {{ webapp_path }}/scripts/docker-weight.sh

# "ace serve" is the watcher process; it forks "bin/server.ts" as the actual
# HTTP server, which keeps holding the port if only the watcher is killed.
kill:
	@-pkill -f "ace serve|bin/server.ts" && echo "dev server killed" || echo "no dev server running"
