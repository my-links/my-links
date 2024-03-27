db:
	docker compose -f dev.docker-compose.yml up -d --wait

dev: db
	npx prisma migrate deploy
	npx prisma generate
	npm run dev

release:
	npm run release

prod:
	-docker network create mylinks_app
	docker compose up -d --build --wait
