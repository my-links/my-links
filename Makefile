CONTAINER_NAME = "docker-my-links-dev-db-1"
ROOT_PASSWORD = "root_passwd"
USER_NAME = "my-user"

start-dev:
	@echo 'Starting DB container'
	docker compose --env-file ../.env -f ./dev.docker-compose.yml up -d

	@echo 'Waiting for a minute (need to set $(USER_NAME) privileges)'
	@sleep 1m

	@echo 'Grant privileges for $(USER_NAME)'
	docker exec -it $(CONTAINER_NAME) mysql -u root -p$(ROOT_PASSWORD) -e "grant ALL PRIVILEGES ON *.* TO '$(USER_NAME)';flush privileges;"

	@echo 'Dont forget to do migrations before run dev'

prod:
	docker compose up -d --build
