dev:
	@docker compose down
	@docker compose -f dev.compose.yml pull
	@docker compose -f dev.compose.yml up -d --wait
	@node ace migration:fresh
	@pnpm run dev

prod:
	@docker compose -f dev.compose.yml down
	@docker compose pull
	@docker compose up -d --build --wait

seed:
	@node ace db:seed

down:
	@-docker compose down
	@-docker compose -f dev.compose.yml down

release:
	@pnpm run release
