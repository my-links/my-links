# Configuration

`.env.example` lives at the repository root. Start from it: [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example).

In a repository checkout the actual `.env` lives at the root too, next to the compose file. Docker Compose and every `just` recipe read it there:

```bash
cp .env.example .env
```

AdonisJS itself looks for `.env` inside `apps/webapp`. A bare `node ace ...` run from `apps/webapp` outside `just` must be prefixed with `ENV_PATH=../..` (or have it exported), otherwise it does not find your variables. A built app (`apps/webapp/build`) reads `build/.env`, see [Docker & compose](/self-hosting/docker#native-deployment).

## Required variables

| Variable                                          | Notes                                                           |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `NODE_ENV`                                        | `development`, `production`, or `test`                          |
| `PORT`                                            | Port the application listens on, e.g. `3333`                    |
| `APP_KEY`                                         | Application secret key, generate with `openssl rand -base64 32` |
| `HOST`                                            | IP address or hostname, e.g. `0.0.0.0` or `localhost`           |
| `LOG_LEVEL`                                       | `info` recommended, see [Logging](#logging)                     |
| `APP_URL`                                         | Public application URL, e.g. `https://your-domain.com`          |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_DATABASE` | PostgreSQL connection                                           |

## Optional variables

| Variable                                    | Notes                                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `DB_PASSWORD`                               | PostgreSQL password, may be omitted for a passwordless local database                     |
| `TZ`                                        | Timezone, e.g. `UTC`                                                                      |
| `ALLOW_REGISTRATION`                        | Whether the instance accepts sign-ups, see [Authentication](/self-hosting/authentication) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in, see [Authentication](/self-hosting/authentication)                        |
| `EXTENSION_IDS`                             | Extra browser extension ids allowed to connect, see below                                 |
| `SMTP_*` / `MAIL_FROM_*`                    | Outgoing mail, see below                                                                  |

## Favicon store

The application caches favicon images on disk instead of re-fetching them on every visit, at a fixed path (`storage/favicons` under the app root, `/app/storage/favicons` in the Docker image, persisted via the `favicon-volume` volume, see [Docker & compose](/self-hosting/docker)). Nothing to configure.

Outside the provided compose file, make sure `/app/storage/favicons` is mounted as a persistent volume (see [Docker & compose](/self-hosting/docker)), or every redeploy wipes the stored icons.

This is a cache, not user data: losing it just means the next visit to each site re-downloads its favicon. It's still worth keeping in your backup strategy for one reason: restoring it avoids a fresh round of outbound requests to every domain your instance has ever bookmarked, all at once, right after a restore.

That leads to the actual thing to know before self-hosting this: resolving a favicon fetches it from the site itself, from your instance's server. On a single-user instance (the common case here) that means the site operator sees your instance's IP request its own favicon at the moment you bookmark it, which is a weaker anonymity property than on a shared multi-user instance where the same request is one among many users' traffic. The request first presents a regular Chrome browser TLS fingerprint and headers, so bot-protection walls that reject plain server HTTP clients let it through, then falls back to a plain server request with a Chrome, Slackbot or Facebook link-preview user agent. Nothing to configure. No third-party fallback provider is contacted unless you explicitly configure one (a future setting, opt-in and disabled by default).

## Google sign-in

To obtain a Client ID and Secret:

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Enable the OAuth 2.0 API.
3. Configure the OAuth consent screen if you have not already.
4. Under **Credentials**, create an **OAuth 2.0 Client ID** of type **Web application**.
5. Add an authorized redirect URI: `http://localhost:3333/auth/callback` for development, or `https://your-domain.com/auth/callback` in production.
6. Set the resulting Client ID and Secret as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Leave both empty to run without Google sign-in. Setting only one of the two is rejected at boot.

## Browser extension

Only the official MyLinks extension builds (Chrome Web Store and Firefox add-on) can be connected to an instance. Connecting asks for your consent first. To allow a development or self-built extension too, list its id in `EXTENSION_IDS`, comma-separated: a 32 letter Chromium id (letters `a` to `p`) or a Firefox add-on id such as `my-extension@example.com`. A malformed entry is rejected at boot.

## Outgoing mail

Email is optional. Leave every `SMTP_*` and `MAIL_*` variable empty and the instance runs without it: the behaviors below are simply unavailable, and account recovery goes through the `node ace user:*` commands instead (see [Console commands](/self-hosting/console-commands)).

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

| Behavior                    | Without outgoing mail                                     | With outgoing mail                                                        |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Signing in with a password  | No confirmation required                                  | A confirmed address is required; the login page offers to resend the link |
| `/forgot-password`          | Unavailable: reset with `node ace user:reset-password`    | Sends a self-service reset link                                           |
| Changing your email address | Unavailable from the settings page: use `node ace user:*` | Two-party confirmation: new address confirms, old address is notified     |
| Admin-issued password reset | Console only: `node ace user:reset-password --link`       | The admin area can email the reset link directly                          |

### In development

`dev.compose.yml` ships [mailpit](https://mailpit.axllent.org/): point `SMTP_HOST` at `127.0.0.1` and `SMTP_PORT` at `1025`, then read everything the app sends on `http://localhost:8025`. Nothing leaves your machine.

### In production

An external SMTP provider is the recommended path. The repository's `compose.yml` does carry a local [`boky/postfix`](https://github.com/bokysan/docker-postfix) relay behind an opt-in profile:

```bash
docker compose --profile smtp up -d
```

with `SMTP_ALLOWED_SENDER_DOMAINS` set to the domains it may send for, `SMTP_RELAYHOST` set if it should forward to an upstream, and the app configured with `SMTP_HOST=smtp` and `SMTP_PORT=587`.

Be aware of what self-hosting a mail transfer agent involves: without SPF, DKIM, DMARC records and a matching reverse DNS entry, Gmail and Outlook drop the mail, and many hosting providers block outbound port 25 outright.

## Logging

`LOG_LEVEL` sets the verbosity of the server log. Use `info` in production.

At `info`, `warn` and `error`, the log records events: which user did what, with the id of the request that triggered it. It never contains email addresses, link URLs, hostnames or search terms.

| Level   | Contains                                                           |
| ------- | ------------------------------------------------------------------ |
| `info`  | Auth events (user id, request id), scheduled job counts            |
| `warn`  | Recoverable problems, such as a favicon that could not be resolved |
| `error` | Failures, such as an email that could not be delivered             |
| `debug` | Everything above, plus link URLs, hostnames and full error details |

`debug` is meant for short troubleshooting sessions: turn it back to `info` afterwards. Even at `debug`, email addresses are never logged.

If you ship logs to a third-party service, keep them at `info`.

### Slow requests

A request that takes 500 ms or more is logged at `info` as `slow request`, with its HTTP method, route pattern (such as `/l/:id`), status and duration. The URL and query string are never part of the line. Every response also carries a `Server-Timing` header, so the browser's network panel shows the server time of each request.

### Correlating an event

- Every request-scoped line carries a `request_id`, so you can follow one request across lines.
- A favicon that failed to resolve is logged without its address. The failing origin and the reason are listed on the admin Favicons page.
- Authentication events are also recorded in the authentication journal, which names the account.

### Upgrading from 5.5.0 or earlier

Earlier versions wrote email addresses on every authentication event and link URLs on every favicon failure, at levels that are always on, and the Docker image defaulted to `debug`. Upgrading changes what gets written from now on, not what is already stored:

- Check `LOG_LEVEL` in your `.env`: an `.env` copied from an older `.env.example` still says `debug`. Set it to `info`.
- Drop the old output. With Docker Compose, `docker compose up -d --force-recreate my-links` starts a fresh container and discards the previous one's log. The `postgres` container's log can hold email addresses too, in constraint violation details: recreate it the same way.
- If you ship logs to another service, delete or let expire what it received before the upgrade, according to its own retention settings.
