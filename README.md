# MyLinks

MyLinks is a tool that lets you manage your favorite links in an intuitive interface.
Free and open source software, focused on privacy and self-hosting.

# Setup

Copy `example.env` file as `.env` and edit the properties.

```
cp example.env .env
```

## Dev

Leave the `DATABASE_URL` property filled

```
cd docker
make start-dev
cd ..
npx prisma db push
npm run dev
```

## Prod

If you want to use your own database leave, the `DATABASE_URL` property filled in `docker/docker-compose.yml` with your databse credentials, otherwise you'll have to delete it.

(wait for `start-prod` script to finish)

```
cd docker
make build
make start-prod
```

## Github Actions

Env var to define :

```
DOCKER_USERNAME="Your docker username"
DOCKER_PASSWORD="Your docker password"
SSH_HOST="Your SSH host"
SSH_USERNAME="Your SSH username"
SSH_KEY="Your SSH key"
```
