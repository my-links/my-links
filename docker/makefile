start-dev:
	docker compose --env-file ../.env -f ./dev.docker-compose.yml up -d

start-prod:
	docker-compose --env-file ../.env -f ./docker-compose.yml up -d

build: 
	docker build -f ./Dockerfile -t sonny/my-links ../