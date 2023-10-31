db:
	docker compose -f dev.docker-compose.yml up -d

dev:
	npm run dev

prod:
	docker compose up -d --build
