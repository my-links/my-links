# Publishing the extension

Publishing runs exclusively through a GitHub Actions workflow via `wxt submit`
(see [WXT's publishing guide](https://wxt.dev/guide/essentials/publishing)).
No local command ever pushes a version to a store — everything below is
one-time setup to obtain the credentials that workflow needs, done entirely
through the Chrome / Firefox dashboards and Google's OAuth Playground (no
CLI). Once the 7 secrets below are in the repo, every future release is:
tag push → GitHub Action → store.

Both listings already exist (Chrome at v1.1.0, Firefox at v1.0.0), so `wxt
submit` will **update** them directly — no manual "create a new listing"
step needed.

## What the workflow needs

| Secret                 | Store   | What it is                             |
| ---------------------- | ------- | -------------------------------------- |
| `CHROME_EXTENSION_ID`  | Chrome  | The id in your store URL               |
| `CHROME_CLIENT_ID`     | Chrome  | OAuth client id (Google Cloud Console) |
| `CHROME_CLIENT_SECRET` | Chrome  | OAuth client secret                    |
| `CHROME_REFRESH_TOKEN` | Chrome  | OAuth refresh token for that client    |
| `FIREFOX_EXTENSION_ID` | Firefox | The add-on's internal id               |
| `FIREFOX_JWT_ISSUER`   | Firefox | AMO API key                            |
| `FIREFOX_JWT_SECRET`   | Firefox | AMO API secret                         |

## 1. Chrome Web Store

**Extension id** — already known:
`agkmlplihacolkakgeccnbhphnepphma` (from your store URL).
→ `CHROME_EXTENSION_ID`

**OAuth client (Google Cloud Console)**

1. [console.cloud.google.com](https://console.cloud.google.com) → create or
   pick a project (any project tied to the Google account that owns the
   Chrome Web Store Developer account).
2. **APIs & Services → Library** → search "Chrome Web Store API" → **Enable**.
3. **APIs & Services → OAuth consent screen** → configure it (External is
   fine; it only needs to work for your own account, "Testing" publish
   status is enough — no Google review required for this use case).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   → Application type **Web application** (not "Desktop app" — the OAuth
   Playground flow below needs a registered redirect URI, which only the
   Web application type has).
5. Under **Authorized redirect URIs**, add exactly:
   ```
   https://developers.google.com/oauthplayground
   ```
   → save. This gives you `CHROME_CLIENT_ID` and `CHROME_CLIENT_SECRET`.

**Refresh token — via OAuth Playground (browser only, no CLI)**

1. Go to [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground).
2. Click the gear icon (top right) → check **Use your own OAuth
   credentials** → paste the Client ID / Client Secret from the step above.
3. In the left panel, under "Step 1", paste this scope into the input field
   and click **Authorize APIs**:
   ```
   https://www.googleapis.com/auth/chromewebstore
   ```
4. Sign in with the Google account that owns the Chrome Web Store listing,
   accept the consent screen.
5. Back in the Playground, **Step 2: Exchange authorization code for
   tokens** → click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** shown.
   → `CHROME_REFRESH_TOKEN`

## 2. Firefox Add-ons (AMO)

**Extension id** — the extension pins a stable id in `wxt.config.ts`
(`browser_specific_settings.gecko.id`), matching the live listing:

```
my-links@mylinks.app
```

→ `FIREFOX_EXTENSION_ID`

**JWT credentials**

1. Log into [addons.mozilla.org](https://addons.mozilla.org) with your
   developer account.
2. Go to **Manage API Keys**:
   [addons.mozilla.org/developers/addon/api/key/](https://addons.mozilla.org/developers/addon/api/key/)
3. Click **Generate new credentials**.
4. Copy the **JWT issuer** and **JWT secret** shown (the secret is only
   shown once).
   → `FIREFOX_JWT_ISSUER` / `FIREFOX_JWT_SECRET`

## 3. Store the secrets

Repo → **Settings → Secrets and variables → Actions → New repository
secret** → add all 7 names from the table above.

## What consumes these secrets

`.github/workflows/cd-extension.yml`, triggered by a GitHub release whose
tag starts with `extension-v` (`cd.yml`'s Docker job is scoped to
`webapp-v*` the same way, so the two releases never trigger each other).

## Cutting a release

From the repo root:

```bash
pnpm run release:extension
```

This runs `release-it` (config in `apps/extension/.release-it.json`):
bumps `apps/extension/package.json`, runs `check` + both `build`s as a
pre-flight, commits, tags `extension-v${version}`, pushes, and opens the
GitHub release. That release event is what triggers `cd-extension.yml` —
still nothing runs locally against either store.

Once the 7 secrets above are added to the repo, this is the whole flow.
