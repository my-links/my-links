# Configuration

`.env.example` lives at the repository root — start from it: [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example).

Where the actual `.env` goes depends on how you run the app. Docker Compose reads it from the repository root, next to the compose file. Native runs — migrations, `node ace`, the dev server — expect it inside `apps/webapp`, since that's where the `node ace` CLI itself resolves it from:

```bash
cp .env.example apps/webapp/.env
```

## Required variables

| Variable                                                          | Notes                                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `NODE_ENV`                                                        | `development`, `production`, or `test`                                         |
| `PORT`                                                            | Port the application listens on, e.g. `3333`                                   |
| `APP_KEY`                                                         | Application secret key — generate with `openssl rand -base64 32`               |
| `HOST`                                                            | IP address or hostname, e.g. `0.0.0.0` or `localhost`                          |
| `LOG_LEVEL`                                                       | e.g. `info`, `debug`                                                           |
| `APP_URL`                                                         | Public application URL, e.g. `https://your-domain.com`                         |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` | PostgreSQL connection                                                          |
| `LIMITER_STORE`                                                   | Where the `/api/v1/*` rate limiter keeps its counters — `database` or `memory` |

## Optional variables

| Variable                                    | Notes                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `SESSION_DRIVER`                            | `database`, `cookie`, or `memory`; defaults to `database`                                  |
| `TZ`                                        | Timezone, e.g. `UTC`                                                                       
| `ALLOW_REGISTRATION`                        | Whether the instance accepts sign-ups — see [Authentication](/self-hosting/authentication) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in — see [Authentication](/self-hosting/authentication)                        |
| `SMTP_*` / `MAIL_FROM_*`                    | Outgoing mail — see below                                                                  |

## Google sign-in

To obtain a Client ID and Secret:

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable the OAuth 2.0 API.
3. Configure the OAuth consent screen if you have not already.
4. Under **Credentials**, create an **OAuth 2.0 Client ID** of type **Web application**.
5. Add an authorized redirect URI: `http://localhost:3333/auth/callback` for development, or `https://your-domain.com/auth/callback` in production.
6. Set the resulting Client ID and Secret as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Leave both empty to run without Google sign-in. Setting only one of the two is rejected at boot.

## Outgoing mail

Email is optional. Leave every `SMTP_*` and `MAIL_*` variable empty and the instance runs without it — the behaviors below are simply unavailable, and account recovery goes through the `node ace user:*` commands instead (see [Console commands](/self-hosting/console-commands)).

Setting any one of them commits you to a complete configuration: `SMTP_HOST` and `MAIL_FROM_ADDRESS` are then both required, and a partial configuration is rejected at boot rather than silently dropping the one email a locked-out user is waiting for.

| Variable            | Notes                                                             |
| ------------------- | ----------------------------------------------------------------- |
| `SMTP_HOST`         | Relay hostname                                                    |
| `SMTP_PORT`         | Defaults to `587`                                                 |
| `SMTP_USERNAME`     | Optional, but requires `SMTP_PASSWORD` when set                   |
| `SMTP_PASSWORD`     | Optional, but requires `SMTP_USERNAME` when set                   |
| `SMTP_SECURE`       | Implicit TLS. Defaults to `true` on port `465`, `false` elsewhere |
| `MAIL_FROM_ADDRESS` | Sender address                                                    |
| `MAIL_FROM_NAME`    | Sender name, defaults to `MyLinks`                                |

### What outgoing mail changes

Four behaviors switch on or off depending on whether mail is configured:

| Behavior                    | Without outgoing mail                                      | With outgoing mail                                                        |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| Signing in with a password  | No confirmation required                                   | A confirmed address is required; the login page offers to resend the link |
| `/forgot-password`          | Unavailable — reset with `node ace user:reset-password`    | Sends a self-service reset link                                           |
| Changing your email address | Unavailable from the settings page — use `node ace user:*` | Two-party confirmation: new address confirms, old address is notified     |
| Admin-issued password reset | Console only: `node ace user:reset-password --link`        | The admin area can email the reset link directly                          |

### In development

`dev.compose.yml` ships [mailpit](https://mailpit.axllent.org/): point `SMTP_HOST` at `127.0.0.1` and `SMTP_PORT` at `1025`, then read everything the app sends on `http://localhost:8025`. Nothing leaves your machine.

### In production

An external SMTP provider is the recommended path. The repository's `compose.yml` does carry a local [`boky/postfix`](https://github.com/bokysan/docker-postfix) relay behind an opt-in profile:

```bash
docker compose --profile smtp up -d
```

with `SMTP_ALLOWED_SENDER_DOMAINS` set to the domains it may send for, `SMTP_RELAYHOST` set if it should forward to an upstream, and the app configured with `SMTP_HOST=smtp` and `SMTP_PORT=587`.

Be aware of what self-hosting a mail transfer agent involves: without SPF, DKIM, DMARC records and a matching reverse DNS entry, Gmail and Outlook drop the mail, and many hosting providers block outbound port 25 outright.
