tuyau:
	@node ace tuyau:generate
	@pnpm run format

dev:
	@docker compose down
	@docker compose -f dev.compose.yml pull
	@docker compose -f dev.compose.yml up -d --wait --remove-orphans
	@node ace migration:fresh
	@pnpm run dev

prod:
	@docker compose -f dev.compose.yml down
	@docker compose pull
	@docker compose up -d --build --wait --remove-orphans

seed:
	@node ace db:seed

fresh:
	@node ace migration:fresh

down:
	@-docker compose down
	@-docker compose -f dev.compose.yml down

release:
	@pnpm run release

docker-weight:
	@DOCKER_IMAGE_WEIGHT=$$(docker save axekin-axekin:latest | wc -c | awk '{printf "%.3f", $$1/1024/1024}'); \
	echo "Docker image weight: $${DOCKER_IMAGE_WEIGHT} Mo"
