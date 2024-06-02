# MyLinks

MyLinks is a tool that lets you manage your favorite links in an intuitive interface.
Free and open source software, focused on privacy and self-hosting.

# Setup

Copy `example.env` file as `.env` and edit the properties.

```
cp example.env .env
```

## Development

### Docker

```shell
make dev
```

### NPM

```shell
# reset database and (force) apply all migrations
node ace migration:fresh
# start dev server
npm run dev
```

## Start as prod

### Docker

```shell
make prod
```

### NPM

```shell
# create production build
npm run build
# go to the build folder
cd build
# clone your .env
cp ../.env .
# then start the production build
npm run start
```

## Generate app_key

```shell
# generate a random app key
openssl rand -base64 32
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
cat ./id_rsa.pub | ssh b@B 'cat >> ~/.ssh/authorized_keys'
# or
ssh-copy-id -i ./id_rsa.pub user@host
```

> Source: https://github.com/appleboy/ssh-action#setting-up-a-ssh-key
