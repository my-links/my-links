# Setup

Créer un fichier .env et éditer les valeurs

```
cp example.env .env
```

## Dev

Laisser la variable d'environnement `DATABASE_URL`

```sh
make start-dev
npx prisma db push
npm run dev
```

## Prod

Retirer la variable d'environnement `DATABASE_URL` si vous souhaitez utiliser la DB dans le docker/docker-compose.yml

```sh
make build
make start-prod
```

(migrations automatiques)
