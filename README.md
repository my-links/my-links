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

If you want to use your own database leave, the `DATABASE_URL` property filled in `docker/docker-compose.yml` with your database credentials, otherwise you'll have to delete it.

```shell
cd docker
make build
make start-prod
```

## GitHub Actions

Env var to define :

```shell
DOCKER_USERNAME="Your docker username"
DOCKER_PASSWORD="Your docker password"
SSH_HOST="Your SSH host"
SSH_PORT="Your SSH port" # use port 22 if you are using the default value
SSH_USERNAME="Your SSH username" # private key
SSH_KEY="Your SSH key" # see below
```

> As a good practice, SSH Key should be generated on local machine instead of target/server/remote machine

Generate :

```shell
ssh-keygen -t rsa -b 4096
# you can save the file in your current folder since you're not supposed to use it personnaly (its purpose is only to be used by CI/CD)
```

Copy :

```shell
cat ~/.ssh/id_rsa.pub | ssh b@B 'cat >> ~/.ssh/authorized_keys'
# or
ssh-copy-id -i ~/.ssh/id_rsa.pub user@host
```

> Source: https://github.com/appleboy/ssh-action#setting-up-a-ssh-key
