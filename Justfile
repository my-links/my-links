webapp_path := "apps/webapp"
webapp_env_file := "apps/webapp/.env"

alias dw := docker-weight

tuyau:
	@cd {{ webapp_path }} && node ace tuyau:generate
	@pnpm run format

extract:
	@cd {{ webapp_path }} && pnpm run extract

compile:
	@cd {{ webapp_path }} && pnpm run compile

format:
	@pnpm run format

_dev:
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

test-unit:
	@cd {{ webapp_path }} && node ace test unit

test-functional:
	@cd {{ webapp_path }} && node ace test functional

test-e2e:
	@cd {{ webapp_path }} && pnpm run test:browser

test: _dev test-unit test-functional test-e2e

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
