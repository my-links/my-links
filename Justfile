alias dw := docker-weight

tuyau:
	@pnpm run tuyau
	@pnpm run format

extract:
	@pnpm run extract

compile:
	@pnpm run compile

format:
	@pnpm run format

dev:
	@docker compose down
	@docker compose -f dev.compose.yml pull
	@docker compose -f dev.compose.yml up -d --wait --remove-orphans
	@cd apps/my-links && node ace migration:fresh
	@pnpm run dev

prod:
	@docker compose -f dev.compose.yml down
	@docker compose pull
	@docker compose up -d --build --wait --remove-orphans

seed:
	@cd apps/my-links && node ace db:seed

fresh:
	@cd apps/my-links && node ace migration:fresh

down:
	@-docker compose down
	@-docker compose -f dev.compose.yml down

release:
	@pnpm run release

docker-weight:
	@sh apps/my-links/scripts/docker-weight.sh
