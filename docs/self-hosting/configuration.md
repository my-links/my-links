# Configuration

Every setting is an environment variable, listed with its default and a short comment in [`.env.example`](https://github.com/my-links/my-links/blob/main/.env.example) at the repository root. Start from it:

```bash
cp .env.example .env
```

The `.env` file lives at the root too, next to the compose file. Docker Compose and every `just` recipe read it there. AdonisJS itself looks for `.env` inside `apps/webapp`, so a bare `node ace ...` run from `apps/webapp` outside `just` must be prefixed with `ENV_PATH=../..` (or have it exported), otherwise it does not find your variables. A built app (`apps/webapp/build`) reads `build/.env`, see [Docker & compose](/self-hosting/docker#native-deployment).

`APP_KEY` is the application secret: generate it with `openssl rand -base64 32`. `APP_URL` is the public URL of the instance, used in links the app generates. The sections below explain the settings that need more than their comment.

## Registration

`ALLOW_REGISTRATION` is commented out in `.env.example`, which keeps sign-up closed to everyone but the first administrator: until an administrator exists, only the setup link logged at boot can register. Once one exists, `/register` is closed. To let anyone create an account, uncomment it and set `ALLOW_REGISTRATION=open`. The three values and the setup token are described in [Authentication](/self-hosting/authentication).

## Account lookup timing

Sign-up, password reset, verification resend and email change behave differently when an account exists (a password hash, a queued email). Left alone, their response time would reveal which addresses have an account, even though the responses are identical. These routes therefore wait until a minimum response time has passed, 750 ms by default, longer than the slowest branch.

`ACCOUNT_LOOKUP_MIN_RESPONSE_MS` overrides that floor, in milliseconds. Leave it unset unless your server is slow enough that the real work exceeds 750 ms, in which case raise it above that. Lowering it weakens the protection.

## Favicon store

The application caches favicon images on disk instead of re-fetching them on every visit, at a fixed path (`storage/favicons` under the app root, `/app/storage/favicons` in the Docker image, persisted via the `favicon-volume` volume, see [Docker & compose](/self-hosting/docker)). Nothing to configure.

Outside the provided compose file, make sure `/app/storage/favicons` is mounted as a persistent volume (see [Docker & compose](/self-hosting/docker)), or every redeploy wipes the stored icons.

This is a cache, not user data: losing it just means the next visit to each site re-downloads its favicon. It's still worth keeping in your backup strategy for one reason: restoring it avoids a fresh round of outbound requests to every domain your instance has ever bookmarked, all at once, right after a restore.

That leads to the actual thing to know before self-hosting this: resolving a favicon fetches it from the site itself, from your instance's server. On a single-user instance (the common case here) that means the site operator sees your instance's IP request its own favicon at the moment you bookmark it, which is a weaker anonymity property than on a shared multi-user instance where the same request is one among many users' traffic. The request first presents a regular Chrome browser TLS fingerprint and headers, so bot-protection walls that reject plain server HTTP clients let it through, then falls back to a plain server request with a Chrome, Slackbot or Facebook link-preview user agent. Nothing to configure. No third-party fallback provider is ever contacted.

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

## Reverse proxy

Behind a reverse proxy, the instance reads the real client IP from `X-Forwarded-For`, but only when the connection comes from a trusted proxy. By default the loopback, link-local and unique local (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`) ranges are trusted, which covers the common Docker and local reverse proxy setups.

That default is wider than most deployments need. Any host in those ranges can claim an arbitrary client IP, which defeats the rate limits and falsifies the IPs recorded in the audit log. Set `TRUSTED_PROXIES` to the exact addresses of your proxy to narrow it, for example:

```
TRUSTED_PROXIES=172.18.0.2,10.0.5.0/24
```

Entries are comma-separated proxy-addr names (`loopback`, `linklocal`, `uniquelocal`), IP addresses or CIDR ranges. When set, the list replaces the default entirely, so include `loopback` if your proxy runs on the same host. A malformed entry is rejected at boot.

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
