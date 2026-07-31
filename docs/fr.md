![](./imgs/screenshots/ml_dashboard_dark.png)

> D'autres captures d'écran sont disponibles dans le dossier [`docs/imgs/screenshots`](./imgs/screenshots).

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
- [Structure du dépôt](#structure-du-dépôt)
- [Déploiement](#déploiement)
  - [Déploiement avec Docker](#déploiement-avec-docker)
  - [Déploiement natif](#déploiement-natif)
- [Développement](#développement)
  - [Configuration de l'environnement](#configuration-de-lenvironnement)
  - [Variables d'environnement Google OAuth](#variables-denvironnement-google-oauth)
  - [Variables d'environnement d'envoi d'e-mails](#variables-denvironnement-denvoi-de-mails)
  - [Politique d'inscription](#politique-dinscription)
  - [Lancer le projet en développement](#lancer-le-projet-en-développement)
  - [Commandes utiles](#commandes-utiles)
- [Extension de navigateur](#extension-de-navigateur)
- [API](#api)
- [Contribuer](#contribuer)
- [Licence](#licence)

## Fonctionnalités principales

- **Organiser les favoris avec des collections** : Gardez vos liens bien organisés et facilement accessibles en les regroupant dans des collections personnalisables. Un lien peut appartenir à plusieurs collections à la fois, et un lien enregistré sans collection atterrit dans votre **Inbox**.
- **Gestion intuitive des liens** : Ajoutez, modifiez et gérez vos favoris sans effort grâce à une interface conviviale.
- **Fonctionnalité de recherche puissante** : Localisez rapidement n'importe quel favori grâce à la fonctionnalité de recherche robuste, améliorant votre productivité.
- **Centré sur la confidentialité et open-source** : Profitez d'une expérience sécurisée et transparente avec une plateforme open-source qui privilégie votre confidentialité.
- **Extension de navigateur** : Consultez, enregistrez et cherchez vos liens depuis un panneau latéral sur Chromium et Firefox, avec une synchronisation bidirectionnelle optionnelle vers vos favoris natifs. Voir [Extension de navigateur](#extension-de-navigateur).
- **Collections partageables** : Partagez facilement vos collections organisées avec d'autres, facilitant la collaboration et le partage d'informations.
- **Les liens les plus utilisés en premier** : Ouvrir un lien compte un clic, ce qui permet de classer vos favoris selon leur usage réel.
- **Développement communautaire** : Contribuez à MyLinks en suggérant des améliorations et des fonctionnalités, aidant à façonner l'outil pour mieux répondre aux besoins des utilisateurs.

## Structure du dépôt

MyLinks est un workspace pnpm :

| Chemin           | Package               | Contenu                                                                   |
| ---------------- | --------------------- | ------------------------------------------------------------------------- |
| `apps/webapp`    | `@my-links/webapp`    | L'application AdonisJS + Inertia/React, et l'API REST qu'elle expose      |
| `apps/extension` | `@my-links/extension` | L'extension de navigateur (WXT + React), pour Chromium MV3 et Firefox MV2 |
| `docs/`          | —                     | La [documentation de l'API](./api.md) et ce README                        |

Les fichiers d'environnement, les migrations et la CLI `node ace` appartiennent tous à `apps/webapp` — c'est là que va le `.env`, pas à la racine du dépôt.

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
    image: postgres:18
    restart: always
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready', '-U', '${DB_USER}']
    volumes:
      - postgres-volume:/var/lib/postgresql
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

3. Créez un fichier `.env` avec toutes les variables d'environnement requises. Vous pouvez utiliser le fichier [`.env.example`](https://github.com/my-links/my-links/blob/main/apps/webapp/.env.example) du repository comme modèle.

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

- **Node.js** version 24.14.0 (ou compatible)
- **pnpm** (gestionnaire de paquets)
- **PostgreSQL** 18 installé et en cours d'exécution
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
cp apps/webapp/.env.example apps/webapp/.env
# Éditez apps/webapp/.env avec vos valeurs
```

4. Assurez-vous que PostgreSQL est installé et en cours d'exécution, puis configurez la connexion dans votre fichier `.env`.

5. Appliquez les migrations de base de données (toutes les commandes `node ace` se lancent depuis `apps/webapp`) :

```bash
cd apps/webapp
node ace migration:run
```

6. Compilez les catalogues de traduction et créez le build de production :

```bash
pnpm run compile
node ace build
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

1. Copiez le fichier `.env.example` vers `.env` (il appartient à la webapp, pas à la racine du dépôt) :

```bash
cp apps/webapp/.env.example apps/webapp/.env
```

2. Éditez le fichier `.env` et configurez les variables suivantes :

**Variables requises :**

- `NODE_ENV` : Environnement (`development`, `production`, ou `test`)
- `PORT` : Port sur lequel l'application écoute (ex: `3333`)
- `APP_KEY` : Clé secrète de l'application (générez-en une avec `openssl rand -base64 32`)
- `HOST` : Adresse IP ou hostname (ex: `0.0.0.0` ou `localhost`)
- `LOG_LEVEL` : Niveau de log (ex: `info`, `debug`)
- `APP_URL` : URL de l'application (ex: `http://localhost:3333`)
- `DB_HOST` : Adresse du serveur PostgreSQL
- `DB_PORT` : Port PostgreSQL (par défaut `5432`)
- `DB_USER` : Utilisateur PostgreSQL
- `DB_PASSWORD` : Mot de passe PostgreSQL (optionnel)
- `DB_DATABASE` : Nom de la base de données
- `LIMITER_STORE` : Où le rate limiter de `/api/v1/*` stocke ses compteurs (`database` ou `memory`)

**Variables optionnelles :**

- `SESSION_DRIVER` : Store de session (`database`, `cookie` ou `memory` ; `database` par défaut). Les tests le forcent à `memory` via `.env.test`.
- `TZ` : Fuseau horaire utilisé par l'application (ex: `UTC`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` : Connexion Google. Laissez les deux vides pour vous en passer — voir [Variables d'environnement Google OAuth](#variables-denvironnement-google-oauth).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` : Envoi d'e-mails. Laissez-les toutes vides pour vous en passer — voir [Variables d'environnement d'envoi d'e-mails](#variables-denvironnement-denvoi-de-mails).
- `ALLOW_REGISTRATION` : Ouverture des inscriptions (`open` ou `closed`). Laissez-la vide pour laisser l'instance décider — voir [Politique d'inscription](#politique-dinscription).

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

### Variables d'environnement d'envoi d'e-mails

L'envoi d'e-mails est optionnel. Laissez toutes les variables `SMTP_*` et `MAIL_*` vides et l'instance démarre sans : les liens de vérification d'adresse, de réinitialisation de mot de passe et le changement d'adresse e-mail sont alors indisponibles, et la récupération de compte passe par les commandes `node ace user:*`.

En définir une seule vous engage à une configuration complète : `SMTP_HOST` et `MAIL_FROM_ADDRESS` deviennent obligatoires, et une configuration partielle est rejetée au démarrage plutôt que de faire disparaître en silence le seul e-mail qu'attend un utilisateur enfermé dehors.

Configurer l'envoi d'e-mails fait aussi du lien de confirmation une condition d'entrée : la connexion par mot de passe exige une adresse confirmée, et la page de connexion propose d'envoyer un nouveau lien à qui se voit refuser l'accès. Sans envoi d'e-mails, cette exigence n'existe pas — une instance qui ne peut envoyer aucun lien ne demande à personne d'en suivre un.

| Variable            | Remarques                                                         |
| ------------------- | ----------------------------------------------------------------- |
| `SMTP_HOST`         | Nom d'hôte du relais                                              |
| `SMTP_PORT`         | `587` par défaut                                                  |
| `SMTP_USERNAME`     | Optionnel, mais exige `SMTP_PASSWORD` s'il est défini             |
| `SMTP_PASSWORD`     | Optionnel, mais exige `SMTP_USERNAME` s'il est défini             |
| `SMTP_SECURE`       | TLS implicite. `true` par défaut sur le port `465`, `false` sinon |
| `MAIL_FROM_ADDRESS` | Adresse d'expédition                                              |
| `MAIL_FROM_NAME`    | Nom d'expédition, `MyLinks` par défaut                            |

En développement, `dev.compose.yml` embarque [mailpit](https://mailpit.axllent.org/) : pointez `SMTP_HOST` sur `127.0.0.1` et `SMTP_PORT` sur `1025`, puis lisez tout ce que l'application envoie sur `http://localhost:8025`. Rien ne quitte votre machine.

**En production, le chemin recommandé reste un fournisseur SMTP externe.** Le [`compose.yml`](../compose.yml) du dépôt embarque tout de même un relais [`boky/postfix`](https://github.com/bokysan/docker-postfix) derrière un profil opt-in :

```bash
docker compose --profile smtp up -d
```

avec `SMTP_ALLOWED_SENDER_DOMAINS` réglé sur les domaines qu'il a le droit d'expédier, `SMTP_RELAYHOST` s'il doit relayer vers un serveur en amont, et l'application configurée avec `SMTP_HOST=smtp` et `SMTP_PORT=587`. Mesurez ce qu'implique l'auto-hébergement d'un MTA : sans enregistrements SPF, DKIM, DMARC et un reverse DNS cohérent, Gmail et Outlook jettent les messages, et beaucoup d'hébergeurs bloquent purement et simplement le port 25 sortant.

### Politique d'inscription

`ALLOW_REGISTRATION` détermine si `/register` accepte de nouveaux comptes.

Laissée vide, l'instance décide elle-même : **ouverte tant qu'elle n'a aucun compte, fermée ensuite.** Ce premier compte devient l'administrateur, quelle que soit la méthode qui l'a créé — le formulaire d'inscription ou la connexion Google. Une instance fraîchement déployée vous laisse donc entrer sans aucune configuration, et cesse d'être un formulaire d'inscription ouvert dès l'instant où vous êtes entré.

| Valeur   | Effet                                                                       |
| -------- | --------------------------------------------------------------------------- |
| vide     | Ouverte jusqu'au premier compte, fermée ensuite                             |
| `open`   | N'importe qui peut créer un compte                                          |
| `closed` | `/register` est refusé ; les comptes s'ajoutent avec `node ace user:create` |

Une adresse soumise n'est jamais confirmée ni démentie : s'inscrire avec une adresse qui a déjà un compte produit exactement la réponse que produit une adresse libre, et aucun e-mail n'est envoyé. C'est ce qui empêche le formulaire de devenir un moyen de savoir qui possède un compte ici.

Si l'[envoi d'e-mails](#variables-denvironnement-denvoi-de-mails) est configuré, un nouveau compte reçoit un lien de confirmation valable 24 heures. Sans lui, aucun lien n'est émis et aucune fonctionnalité n'est bloquée par une adresse non confirmée.

### Lancer le projet en développement

#### Avec Docker

La méthode recommandée pour le développement utilise Docker pour la base de données PostgreSQL. Les recettes sont définies dans le [`Justfile`](../Justfile) et se lancent avec [just](https://github.com/casey/just) :

```bash
just dev
```

Cette commande va :

- Démarrer un conteneur PostgreSQL
- Réinitialiser la base de données et appliquer toutes les migrations
- Démarrer le serveur de développement avec le hot-reload activé

#### Sans Docker (natif)

Si vous préférez utiliser PostgreSQL installé localement :

1. Assurez-vous que PostgreSQL est installé et en cours d'exécution
2. Configurez les variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, et `DB_DATABASE` dans `apps/webapp/.env`
3. Réinitialisez la base de données et appliquez les migrations :

```bash
cd apps/webapp && node ace migration:fresh
```

4. Démarrez le serveur de développement :

```bash
pnpm run dev:webapp
```

Le serveur de développement sera accessible sur `http://localhost:3333` (ou le port configuré dans votre `.env`).

#### Travailler sur l'extension

L'extension a besoin d'une webapp en cours d'exécution pour avoir quelque chose à interroger. Une fois celle-ci lancée, depuis la racine du dépôt :

```bash
pnpm run dev:extension
```

Voir [`apps/extension/README.md`](../apps/extension/README.md) pour le side-load, les builds Firefox et le reste.

### Commandes utiles

À lancer depuis la racine du dépôt :

| Commande                                | Ce qu'elle fait                                                   |
| --------------------------------------- | ----------------------------------------------------------------- |
| `just dev`                              | Conteneur de base de données + migrations + serveur de dev webapp |
| `just fresh`                            | Réinitialise la base et rejoue toutes les migrations              |
| `just seed`                             | Remplit la base avec des données de test                          |
| `just down`                             | Arrête les conteneurs de dev et de production                     |
| `just prod`                             | Lance la stack compose de production en local                     |
| `just extract` / `just compile`         | Extrait et compile les catalogues i18n                            |
| `pnpm run dev:webapp` / `dev:extension` | Serveur de dev pour l'un des workspaces                           |
| `pnpm run build`                        | Build de tous les workspaces                                      |
| `pnpm run test`                         | Suite de tests webapp (nécessite PostgreSQL sur l'hôte configuré) |
| `pnpm run check`                        | Lint, vérification du format et typecheck sur tout le monorepo    |

## Extension de navigateur

L'extension officielle vit dans [`apps/extension`](../apps/extension) et fonctionne avec **n'importe quelle** instance — l'instance publique ou votre propre déploiement self-hosted. Elle cible Chromium (MV3) et Firefox (MV2) depuis une source unique.

- Un **panneau latéral** (sidebar sur Firefox) et une **page nouvel onglet** pour consulter, créer et modifier collections et liens
- **Capture rapide** depuis la barre d'outils ou le menu contextuel, avec détection des doublons
- **Recherche** accessible depuis n'importe où par raccourci clavier
- **Tolérante au hors-ligne** : la dernière synchro est mise en cache, les données périmées sont signalées, un token expiré demande une reconnexion
- **Miroir de favoris optionnel** : synchronisation bidirectionnelle entre vos collections et les favoris natifs du navigateur, avec les favoris épinglés sur la barre, classés selon la fréquence d'ouverture

La connexion tient en un clic : l'extension vous envoie sur `/extension/authorize` de votre instance, qui émet un token d'API et le renvoie au navigateur. Les tokens se consultent et se révoquent depuis `/user/settings`.

La documentation complète — installation, permissions et différences entre navigateurs — est dans [`apps/extension/README.md`](../apps/extension/README.md).

## API

MyLinks expose une API REST sous `/api/v1`, authentifiée par token Bearer créé depuis `/user/settings`. Elle alimente l'extension de navigateur et est documentée dans [`docs/api.md`](./api.md).

Un document OpenAPI 3.1 est généré depuis les sources avec `node ace openapi:generate` (depuis `apps/webapp`) ; c'est lui qui sert à construire le client typé de l'extension.

## Contribuer

Nous accueillons les contributions ! Veuillez visiter notre tableau Trello pour les détails de gestion de projet et de feuille de route. Vous pouvez contribuer en :

- Créant des issues pour les bugs, fonctionnalités ou discussions.
- Soumettant des pull requests (PR) avec des corrections de bugs, nouvelles fonctionnalités ou mises à jour de documentation.

Pour des directives de contribution détaillées, consultez le fichier CONTRIBUTING.md.

## Licence

Ce projet est sous licence [GPLv3](./LICENSE).
