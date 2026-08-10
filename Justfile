webapp_path := "apps/webapp"
webapp_env_file := "apps/webapp/.env"

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
	@docker compose --env-file {{ webapp_env_file }} down
	@docker compose -f dev.compose.yml --env-file {{ webapp_env_file }} pull
	@docker compose -f dev.compose.yml --env-file {{ webapp_env_file }} up -d --wait --remove-orphans
	@cd {{ webapp_path }} && node ace migration:fresh
dev: _dev
	@cd {{ webapp_path }} && node ace db:seed
	@pnpm run dev:webapp

prod:
	@docker compose -f dev.compose.yml --env-file {{ webapp_env_file }} down
	@docker compose --env-file {{ webapp_env_file }} pull
	@docker compose --env-file {{ webapp_env_file }} up -d --build --wait --remove-orphans

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
	@-docker compose --env-file {{ webapp_env_file }} down
	@-docker compose -f dev.compose.yml --env-file {{ webapp_env_file }} down

release:
	@pnpm run release:webapp

docker-weight:
	@sh {{ webapp_path }}/scripts/docker-weight.sh
