start-prod:
	docker compose --env-file .env up -d

start-dev:
	docker compose --env-file .env -f ./docker-compose.yml -f ./dev.docker-compose.yml up -d

stop:
	docker compose down

build:
	docker build -f ./Dockerfile -t sonny/my-links .
