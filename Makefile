dev:
	@docker compose down
	@docker compose -f dev.docker-compose.yml up -d --wait
	@node ace migration:fresh
	@pnpm run dev

prod:
	@docker compose -f dev.docker-compose.yml down
	@docker compose up -d --build --wait

seed:
	@node ace db:seed

down:
	@-docker compose down
	@-docker compose -f dev.docker-compose.yml down

release:
	@pnpm run release
