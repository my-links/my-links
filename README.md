![](./docs/imgs/screenshots/ml_dashboard_dark.png)

> More screenshots are available in the [`docs/imgs/screenshots`](./docs/imgs/screenshots) directory.

<div align="center">
  <h1>MyLinks</h1>
  <p>Another bookmark manager that lets you manage and share<br>your favorite links in an intuitive interface</p>
  <p>
    <a href="https://github.com/my-links/my-links/releases/latest"><img src="https://img.shields.io/github/v/release/my-links/my-links?label=version" alt="Latest Release"></a>
    <a href="https://github.com/my-links/my-links/issues"><img src="https://img.shields.io/github/issues/my-links/my-links.svg" alt="GitHub Issues"></a>
    <a href="https://github.com/my-links/my-links/blob/main/LICENSE"><img src="https://img.shields.io/github/license/my-links/my-links.svg" alt="License"></a>
  </p>
  <p>
    <a href="./docs/fr.md">🇫🇷 Read in French</a>
  </p>
</div>

## Table of Contents

- [Main Features](#main-features)
- [Repository Layout](#repository-layout)
- [Deployment](#deployment)
  - [Docker Deployment](#docker-deployment)
  - [Native Deployment](#native-deployment)
- [Development](#development)
  - [Environment Configuration](#environment-configuration)
  - [Google OAuth Environment Variables](#google-oauth-environment-variables)
  - [Outgoing Mail Environment Variables](#outgoing-mail-environment-variables)
  - [Registration Policy](#registration-policy)
  - [Running the Project in Development](#running-the-project-in-development)
  - [Useful Commands](#useful-commands)
- [Browser Extension](#browser-extension)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Main Features

- **Organize bookmarks with collections**: Keep your links tidy and easily accessible by grouping them into customizable collections. A link can live in several collections at once, and one saved without a collection lands in your **Inbox**.
- **Intuitive link management**: Add, edit, and manage your bookmarks effortlessly with a user-friendly interface.
- **Powerful search functionality**: Quickly locate any bookmark using the robust search feature, enhancing your productivity.
- **Privacy-focused and open-source**: Enjoy a secure, transparent experience with an open-source platform that prioritizes your privacy.
- **Browser extension**: Browse, save and search your links from a side panel in Chromium and Firefox, with optional two-way syncing to your native bookmarks. See [Browser Extension](#browser-extension).
- **Shareable collections**: Easily share your curated collections with others, facilitating collaboration and information sharing.
- **Most-used links first**: Opening a link counts a click, so your favourites can be ranked by how often you actually use them.
- **Community-driven development**: Contribute to MyLinks by suggesting improvements and features, helping to shape the tool to better meet user needs.

## Repository Layout

MyLinks is a pnpm workspace:

| Path             | Package               | What it is                                                                  |
| ---------------- | --------------------- | --------------------------------------------------------------------------- |
| `apps/webapp`    | `@my-links/webapp`    | The AdonisJS + Inertia/React application, and the REST API it exposes       |
| `apps/extension` | `@my-links/extension` | The browser extension (WXT + React), targeting Chromium MV3 and Firefox MV2 |
| `docs/`          | —                     | [API documentation](./docs/api.md) and the French [README](./docs/fr.md)    |

Environment files, migrations and the `node ace` CLI all belong to `apps/webapp` — that is where a `.env` goes, not the repository root.

## Deployment

### Docker Deployment

#### Prerequisites

- **Docker** and **Docker Compose**
- A `.env` file configured with all required environment variables

1. Create a directory for your deployment and navigate to it:

```bash
mkdir my-links-deployment
cd my-links-deployment
```

2. Create a `docker-compose.yml` file with the following content:

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

3. Create a `.env` file with all required environment variables. You can use the [`.env.example`](https://github.com/my-links/my-links/blob/main/apps/webapp/.env.example) from the repository as a template.

4. Start the application with Docker Compose:

```bash
docker compose up -d
```

This will:

- Pull the MyLinks image from [Docker Hub](https://hub.docker.com/r/sonny93/my-links)
- Start the PostgreSQL container
- Start the MyLinks container
- Automatically apply database migrations
- Start the application in production mode

The application will be accessible on the port configured in the `PORT` variable of your `.env` file (default `3333`).

### Native Deployment

#### Prerequisites

- **Node.js** version 24.14.0 (or compatible)
- **pnpm** (package manager)
- **PostgreSQL** 18 installed and running
- A `.env` file configured with all required environment variables

1. Clone the repository:

```bash
git clone https://github.com/my-links/my-links.git
cd my-links
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy the `.env.example` file to `.env` and configure the environment variables:

```bash
cp apps/webapp/.env.example apps/webapp/.env
# Edit apps/webapp/.env with your values
```

4. Make sure PostgreSQL is installed and running, then configure the connection in your `.env` file.

5. Apply database migrations (every `node ace` command runs from `apps/webapp`):

```bash
cd apps/webapp
node ace migration:run
```

6. Compile the translation catalogs and create the production build:

```bash
pnpm run compile
node ace build
```

7. Copy the `.env` file to the `build` directory:

```bash
cp .env build/
```

8. Start the application:

```bash
cd build
pnpm run start
```

The application will be accessible on the port configured in the `PORT` variable of your `.env` file.

## Development

### Environment Configuration

1. Copy the `.env.example` file to `.env` (it belongs to the webapp, not the repository root):

```bash
cp apps/webapp/.env.example apps/webapp/.env
```

2. Edit the `.env` file and configure the following variables:

**Required variables:**

- `NODE_ENV`: Environment (`development`, `production`, or `test`)
- `PORT`: Port on which the application listens (e.g., `3333`)
- `APP_KEY`: Application secret key (generate one with `openssl rand -base64 32`)
- `HOST`: IP address or hostname (e.g., `0.0.0.0` or `localhost`)
- `LOG_LEVEL`: Log level (e.g., `info`, `debug`)
- `APP_URL`: Application URL (e.g., `http://localhost:3333`)
- `DB_HOST`: PostgreSQL server address
- `DB_PORT`: PostgreSQL port (default `5432`)
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password (optional)
- `DB_DATABASE`: Database name
- `LIMITER_STORE`: Where the `/api/v1/*` rate limiter keeps its counters (`database` or `memory`)

**Optional variables:**

- `SESSION_DRIVER`: Session store (`database`, `cookie`, or `memory`; defaults to `database`). Tests override it to `memory` through `.env.test`.
- `TZ`: Timezone used by the application (e.g., `UTC`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google sign-in. Leave both empty to run without it — see [Google OAuth Environment Variables](#google-oauth-environment-variables).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_SECURE`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`: Outgoing mail. Leave them all empty to run without it — see [Outgoing Mail Environment Variables](#outgoing-mail-environment-variables).
- `ALLOW_REGISTRATION`: Whether the instance accepts sign-ups (`open` or `closed`). Leave it unset to let the instance decide — see [Registration Policy](#registration-policy).

**Generate an application key:**

```bash
openssl rand -base64 32
```

### Google OAuth Environment Variables

To obtain the Google Client ID and Secret required for authentication:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Enable the **Google+ API** (or use the OAuth 2.0 API directly)
4. Go to **Credentials** > **Create credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if not already done:
   - Application type: **Internal** or **External**
   - Fill in the required information (application name, support email, etc.)
6. Create the OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: choose a name for your application
   - Authorized redirect URIs: add `http://localhost:3333/auth/callback` for development (or your production URL + `/auth/callback`)
7. Once created, you will get:
   - **Client ID**: to set in `GOOGLE_CLIENT_ID`
   - **Client Secret**: to set in `GOOGLE_CLIENT_SECRET`

> **Note**: For production, make sure to add your production URL in the authorized redirect URIs (e.g., `https://your-domain.com/auth/callback`)

### Outgoing Mail Environment Variables

Email is optional. Leave every `SMTP_*` and `MAIL_*` variable empty and the instance runs without it — email verification, password reset links and changing your email address are simply unavailable, and account recovery goes through the `node ace user:*` commands instead.

Setting any one of them commits you to a complete configuration: `SMTP_HOST` and `MAIL_FROM_ADDRESS` are then both required, and a partial configuration is rejected at boot rather than silently dropping the one email a locked-out user is waiting for.

Configuring outgoing mail also turns the confirmation link into a condition of entry: signing in with a password requires a confirmed address, and the login page offers to send a fresh link to anyone turned away. Without outgoing mail there is no such requirement — an instance that cannot send a link never asks anyone to follow one.

| Variable            | Notes                                                             |
| ------------------- | ----------------------------------------------------------------- |
| `SMTP_HOST`         | Relay hostname                                                    |
| `SMTP_PORT`         | Defaults to `587`                                                 |
| `SMTP_USERNAME`     | Optional, but requires `SMTP_PASSWORD` when set                   |
| `SMTP_PASSWORD`     | Optional, but requires `SMTP_USERNAME` when set                   |
| `SMTP_SECURE`       | Implicit TLS. Defaults to `true` on port `465`, `false` elsewhere |
| `MAIL_FROM_ADDRESS` | Sender address                                                    |
| `MAIL_FROM_NAME`    | Sender name, defaults to `MyLinks`                                |

In development, `dev.compose.yml` ships [mailpit](https://mailpit.axllent.org/): point `SMTP_HOST` at `127.0.0.1` and `SMTP_PORT` at `1025`, then read everything the app sends on `http://localhost:8025`. Nothing leaves your machine.

**An external SMTP provider is the recommended path in production.** The repository's [`compose.yml`](./compose.yml) does carry a local [`boky/postfix`](https://github.com/bokysan/docker-postfix) relay behind an opt-in profile:

```bash
docker compose --profile smtp up -d
```

with `SMTP_ALLOWED_SENDER_DOMAINS` set to the domains it may send for, `SMTP_RELAYHOST` set if it should forward to an upstream, and the app configured with `SMTP_HOST=smtp` and `SMTP_PORT=587`. Be aware of what self-hosting an MTA involves: without SPF, DKIM, DMARC records and a matching reverse DNS entry, Gmail and Outlook drop the mail, and many hosting providers block outbound port 25 outright.

### Registration Policy

`ALLOW_REGISTRATION` decides whether `/register` accepts new accounts.

Left unset, the instance answers for itself: **open until it has its first account, closed from then on.** That first account becomes the administrator, whichever method created it — the registration form or Google sign-in. A freshly deployed instance therefore lets you in without any configuration, and stops being an open sign-up form the moment you are in.

| Value    | Effect                                                                 |
| -------- | ---------------------------------------------------------------------- |
| unset    | Open until the first account exists, closed afterwards                 |
| `open`   | Anyone can create an account                                           |
| `closed` | `/register` is refused; accounts are added with `node ace user:create` |

A submitted address is never confirmed or denied: registering with an address that already has an account produces exactly the response a free address produces, and no email is sent. That is what keeps the form from becoming a way to find out who has an account here.

If [outgoing mail](#outgoing-mail-environment-variables) is configured, a new account receives a confirmation link valid for 24 hours. Without it, no link is issued and no feature is gated behind an unconfirmed address.

### Managing Accounts from the Console

Everything the settings pages do to an account, an operator with a shell can do too — which is what keeps an instance with no outgoing mail recoverable.

| Command                | What it does                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| `user:create`          | Opens an account, regardless of `ALLOW_REGISTRATION`                       |
| `user:list`            | Lists the accounts, with `--admin`, `--unverified` and `--provider=google` |
| `user:reset-password`  | Writes a new password, or prints a single-use reset link with `--link`     |
| `user:set-role`        | Promotes to administrator or demotes to member                             |
| `user:verify-email`    | Marks an address as confirmed                                              |
| `user:unlink-provider` | Detaches a sign-in provider                                                |
| `user:delete`          | Deletes an account and everything it owns                                  |

Every command takes the address as an argument and asks for whatever is missing, so each one is usable both from a script and by hand:

```bash
node ace user:create ada@example.com --name="Ada Lovelace" --admin
node ace user:reset-password ada@example.com --link
node ace user:list --unverified
```

Passwords are only ever asked for, never read from a flag: an argument would sit in the shell history and in the process list of every user on the machine. Deleting an account likewise always asks for its address to be retyped — there is no flag to skip that, and nothing here can undo it.

Two refusals are deliberate. A provider cannot be unlinked when it is the only way into the account, and the last administrator of an instance cannot be demoted; both would produce a state no page in the interface can repair.

### The Admin Area

An administrator reaches `/admin`, which holds two tabs.

**Accounts** lists every account with what it owns, whether its address was ever confirmed, how it can sign in, and when it last did. Four actions are available per account, all of them also reachable from the console: mail a reset link (only where outgoing mail is configured — otherwise `user:reset-password --link`), mark an address confirmed, revoke every browser session and extension token, and promote or demote. The same refusals apply as on the console: the last administrator of an instance cannot be demoted.

**Authentication journal** shows what `auth_events` recorded — sign-ins, refusals, password and address changes, provider links, sudo confirmations — newest first, 50 at a time. An action an administrator took on somebody else's account names both the account and the administrator, so an admin action is never mistaken for something the owner did.

### Running the Project in Development

#### With Docker

The recommended method for development uses Docker for the PostgreSQL database. Recipes are defined in the [`Justfile`](./Justfile) and run with [just](https://github.com/casey/just):

```bash
just dev
```

This command will:

- Start a PostgreSQL container
- Reset the database and apply all migrations
- Start the development server with hot-reload enabled

#### Without Docker (Native)

If you prefer to use locally installed PostgreSQL:

1. Make sure PostgreSQL is installed and running
2. Configure the `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_DATABASE` variables in `apps/webapp/.env`
3. Reset the database and apply migrations:

```bash
cd apps/webapp && node ace migration:fresh
```

4. Start the development server:

```bash
pnpm run dev:webapp
```

The development server will be accessible at `http://localhost:3333` (or the port configured in your `.env`).

#### Working on the Extension

The extension needs a running webapp to talk to. With one started, from the repository root:

```bash
pnpm run dev:extension
```

See [`apps/extension/README.md`](./apps/extension/README.md) for side-loading, Firefox builds and the rest.

### Useful Commands

Run from the repository root:

| Command                                 | What it does                                                |
| --------------------------------------- | ----------------------------------------------------------- |
| `just dev`                              | Database container + migrations + webapp dev server         |
| `just fresh`                            | Reset the database and re-run every migration               |
| `just seed`                             | Seed the database                                           |
| `just down`                             | Stop the dev and production containers                      |
| `just prod`                             | Run the production compose stack locally                    |
| `just extract` / `just compile`         | Extract and compile the i18n catalogs                       |
| `pnpm run dev:webapp` / `dev:extension` | Dev server for one workspace                                |
| `pnpm run build`                        | Build every workspace                                       |
| `pnpm run test`                         | Webapp test suite (needs PostgreSQL on the configured host) |
| `pnpm run check`                        | Lint, format check and typecheck across the monorepo        |

## Browser Extension

The official extension lives in [`apps/extension`](./apps/extension) and works against **any** instance — the public one or your own self-hosted deployment. It targets Chromium (MV3) and Firefox (MV2) from a single source.

- A **side panel** (sidebar on Firefox) and a **new tab page** to browse, create and edit collections and links
- **Quick capture** from the toolbar or the context menu, with duplicate detection
- **Search** reachable from anywhere with a keyboard shortcut
- **Offline-tolerant**: the last sync is cached, stale data is flagged, an expired token asks for a reconnect
- **Optional bookmark mirroring**: two-way sync between your collections and the browser's native bookmarks, with favourites pinned to the bookmarks bar ordered by how often you open them

Connecting is a one-click handoff: the extension sends you to `/extension/authorize` on your instance, which issues an API token and hands it back to the browser. Tokens can be reviewed and revoked from `/user/settings`.

Full documentation — including install, permissions and browser differences — is in [`apps/extension/README.md`](./apps/extension/README.md).

## API

MyLinks exposes a REST API under `/api/v1`, authenticated with Bearer tokens created from `/user/settings`. It backs the browser extension and is documented in [`docs/api.md`](./docs/api.md).

An OpenAPI 3.1 document is generated from the source with `node ace openapi:generate` (from `apps/webapp`), and is what the extension's typed client is built from.

## Contributing

We welcome contributions! Please visit our Trello board for project management and roadmap details. You can contribute by:

- Creating issues for bugs, features, or discussions.
- Submitting pull requests (PRs) with bug fixes, new features, or documentation updates.

For detailed contribution guidelines, refer to the CONTRIBUTING.md file.

## License

This project is licensed under the [GPLv3 License](./LICENSE).
