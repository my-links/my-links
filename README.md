# Setup

Créer un fichier .env et éditer les valeurs

```
cp example.env .env
```

## Dev

Laisser la variable d'environnement `DATABASE_URL`

```
cd docker
make start-dev
cd ..
npx prisma db push
npm run dev
```

## Prod

Retirer la variable d'environnement `DATABASE_URL` si vous souhaitez utiliser la DB dans le docker/docker-compose.yml

```
cd docker
make build
make start-prod
```

(migrations automatiques)
