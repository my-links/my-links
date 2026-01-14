![](./imgs/ml_dashboard_dark.png)

<div align="center">
  <h1>MyLinks</h1>
  <p>Another bookmark manager that lets you manage and share<br>your favorite links in an intuitive interface</p>
  <p>
    <a href="https://github.com/my-links/my-links/releases/latest"><img src="https://img.shields.io/github/v/release/my-links/my-links?label=version" alt="Latest Release"></a>
    <a href="https://github.com/my-links/my-links/issues"><img src="https://img.shields.io/github/issues/my-links/my-links.svg" alt="GitHub Issues"></a>
    <a href="https://github.com/my-links/my-links/blob/main/LICENSE"><img src="https://img.shields.io/github/license/my-links/my-links.svg" alt="License"></a>
    <a href="https://trello.com/b/CwxkMeZp/mylinks"><img src="https://img.shields.io/badge/roadmap-Trello-blue" alt="Project Roadmap"></a>
  </p>
  <p>
    <a href="../README.md">🇬🇧 Read in English</a>
  </p>
</div>

## Table of Contents

- [Fonctionnalités principales](#fonctionnalités-principales)
- [Déploiement](#déploiement)
  - [Déploiement avec Docker](#déploiement-avec-docker)
  - [Déploiement natif](#déploiement-natif)
- [Développement](#développement)
  - [Configuration de l'environnement](#configuration-de-lenvironnement)
  - [Variables d'environnement Google OAuth](#variables-denvironnement-google-oauth)
  - [Lancer le projet en développement](#lancer-le-projet-en-développement)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Fonctionnalités principales

- **Organiser les favoris avec des collections** : Gardez vos liens bien organisés et facilement accessibles en les regroupant dans des collections personnalisables.
- **Gestion intuitive des liens** : Ajoutez, modifiez et gérez vos favoris sans effort grâce à une interface conviviale.
- **Fonctionnalité de recherche puissante** : Localisez rapidement n'importe quel favori grâce à la fonctionnalité de recherche robuste, améliorant votre productivité.
- **Centré sur la confidentialité et open-source** : Profitez d'une expérience sécurisée et transparente avec une plateforme open-source qui privilégie votre confidentialité.
- **Extension de navigateur (à venir)** : Intégrez MyLinks de manière transparente dans votre expérience de navigation avec la prochaine extension de navigateur officielle.
- **Collections partageables** : Partagez facilement vos collections organisées avec d'autres, facilitant la collaboration et le partage d'informations.
- **Développement communautaire** : Contribuez à MyLinks en suggérant des améliorations et des fonctionnalités, aidant à façonner l'outil pour mieux répondre aux besoins des utilisateurs.

## Déploiement

### Déploiement avec Docker

#### Prérequis

- **Docker** et **Docker Compose**
- Un fichier `.env` configuré avec toutes les variables d'environnement nécessaires

1. Créez un répertoire pour votre déploiement et naviguez-y :

```bash
mkdir my-links-deployment
cd my-links-deployment
```

2. Créez un fichier `docker-compose.yml` avec le contenu suivant :

```yaml
name: my-links
services:
  postgres:
    container_name: postgres
    image: postgres:16
    restart: always
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready', '-U', '${DB_USER}']
    volumes:
      - postgres-volume:/var/lib/postgresql/data
    ports:
      - '${DB_PORT}:5432'

  my-links:
    container_name: my-links
    image: sonny93/my-links:latest
    restart: always
    environment:
      - DB_HOST=postgres
      - HOST=0.0.0.0
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - ${PORT}:3333

volumes:
  postgres-volume:
```

3. Créez un fichier `.env` avec toutes les variables d'environnement requises. Vous pouvez utiliser le fichier [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example) du repository comme modèle.

4. Lancez l'application avec Docker Compose :

```bash
docker compose up -d
```

Cela va :

- Télécharger l'image MyLinks depuis [Docker Hub](https://hub.docker.com/r/sonny93/my-links)
- Démarrer le conteneur PostgreSQL
- Démarrer le conteneur MyLinks
- Appliquer automatiquement les migrations de base de données
- Démarrer l'application en mode production

L'application sera accessible sur le port configuré dans la variable `PORT` de votre fichier `.env` (par défaut `3333`).

### Déploiement natif

#### Prérequis

- **Node.js** version 24.11.0 (ou compatible)
- **pnpm** (gestionnaire de paquets)
- **PostgreSQL** 16 installé et en cours d'exécution
- Un fichier `.env` configuré avec toutes les variables d'environnement nécessaires

1. Clonez le repository :

```bash
git clone https://github.com/my-links/my-links.git
cd my-links
```

2. Installez les dépendances :

```bash
pnpm install
```

3. Copiez le fichier `.env.example` vers `.env` et configurez les variables d'environnement :

```bash
cp .env.example .env
# Éditez le fichier .env avec vos valeurs
```

4. Assurez-vous que PostgreSQL est installé et en cours d'exécution, puis configurez la connexion dans votre fichier `.env`.

5. Appliquez les migrations de base de données :

```bash
node ace migration:run
```

6. Créez le build de production :

```bash
pnpm run build
```

7. Copiez le fichier `.env` dans le dossier `build` :

```bash
cp .env build/
```

8. Démarrez l'application :

```bash
cd build
pnpm run start
```

L'application sera accessible sur le port configuré dans la variable `PORT` de votre fichier `.env`.

## Développement

### Configuration de l'environnement

1. Copiez le fichier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

2. Éditez le fichier `.env` et configurez les variables suivantes :

**Variables requises :**

- `NODE_ENV` : Environnement (`development`, `production`, ou `test`)
- `PORT` : Port sur lequel l'application écoute (ex: `3333`)
- `APP_KEY` : Clé secrète de l'application (générez-en une avec `openssl rand -base64 32`)
- `HOST` : Adresse IP ou hostname (ex: `0.0.0.0` ou `localhost`)
- `LOG_LEVEL` : Niveau de log (ex: `info`, `debug`)
- `SESSION_DRIVER` : Driver de session (`cookie` ou `memory`)
- `APP_URL` : URL de l'application (ex: `http://localhost:3333`)
- `DB_HOST` : Adresse du serveur PostgreSQL
- `DB_PORT` : Port PostgreSQL (par défaut `5432`)
- `DB_USER` : Utilisateur PostgreSQL
- `DB_PASSWORD` : Mot de passe PostgreSQL (optionnel)
- `DB_DATABASE` : Nom de la base de données
- `GOOGLE_CLIENT_ID` : Client ID Google OAuth
- `GOOGLE_CLIENT_SECRET` : Client Secret Google OAuth

**Générer une clé d'application :**

```bash
openssl rand -base64 32
```

### Variables d'environnement Google OAuth

Pour obtenir le Client ID et Secret Google nécessaires à l'authentification :

1. Accédez à la [Console Google Cloud](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Google+ API** (ou utilisez directement l'API OAuth 2.0)
4. Allez dans **Identifiants** (Credentials) > **Créer des identifiants** > **ID client OAuth 2.0**
5. Configurez l'écran de consentement OAuth si ce n'est pas déjà fait :
   - Type d'application : **Interne** ou **Externe**
   - Remplissez les informations requises (nom de l'application, email de support, etc.)
6. Créez l'ID client OAuth 2.0 :
   - Type d'application : **Application Web**
   - Nom : choisissez un nom pour votre application
   - URI de redirection autorisés : ajoutez `http://localhost:3333/auth/callback` pour le développement (ou votre URL de production + `/auth/callback`)
7. Une fois créé, vous obtiendrez :
   - **Client ID** : à définir dans `GOOGLE_CLIENT_ID`
   - **Client Secret** : à définir dans `GOOGLE_CLIENT_SECRET`

> **Note** : Pour la production, assurez-vous d'ajouter votre URL de production dans les URI de redirection autorisés (ex: `https://votre-domaine.com/auth/callback`)

### Lancer le projet en développement

#### Avec Docker

La méthode recommandée pour le développement utilise Docker pour la base de données PostgreSQL :

```bash
make dev
```

Cette commande va :

- Démarrer un conteneur PostgreSQL
- Réinitialiser la base de données et appliquer toutes les migrations
- Démarrer le serveur de développement avec le hot-reload activé

#### Sans Docker (natif)

Si vous préférez utiliser PostgreSQL installé localement :

1. Assurez-vous que PostgreSQL est installé et en cours d'exécution
2. Configurez les variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, et `DB_DATABASE` dans votre fichier `.env`
3. Réinitialisez la base de données et appliquez les migrations :

```bash
node ace migration:fresh
```

4. Démarrez le serveur de développement :

```bash
pnpm run dev
```

Le serveur de développement sera accessible sur `http://localhost:3333` (ou le port configuré dans votre `.env`).

## Contribuer

Nous accueillons les contributions ! Veuillez visiter notre tableau Trello pour les détails de gestion de projet et de feuille de route. Vous pouvez contribuer en :

- Créant des issues pour les bugs, fonctionnalités ou discussions.
- Soumettant des pull requests (PR) avec des corrections de bugs, nouvelles fonctionnalités ou mises à jour de documentation.

Pour des directives de contribution détaillées, consultez le fichier CONTRIBUTING.md.

## Licence

Ce projet est sous licence [GPLv3](./LICENSE).
