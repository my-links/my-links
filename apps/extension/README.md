# MyLinks browser extension

The official MyLinks extension, built with [WXT](https://wxt.dev) and React for Chromium (MV3) and Firefox (MV2) from one source. It talks to any MyLinks instance over the [REST API](https://docs.mylinks.app/api/).

This page is for contributors. To install and use the extension, see the [user guide](https://docs.mylinks.app/guide/browser-extension). Releases are published by a workflow, see [PUBLISHING.md](./PUBLISHING.md).

## Development setup

The extension needs a running webapp, see [Development setup](https://docs.mylinks.app/contributing#development-setup). Then install the dependencies and start a dev build in a throwaway browser profile with hot reload:

```bash
pnpm install
pnpm --filter @my-links/extension dev           # Chromium
pnpm --filter @my-links/extension dev:firefox   # Firefox
```

The scripts (build, zip, tests, type generation) are listed in [`package.json`](./package.json). `pnpm --filter @my-links/extension check` runs the typecheck and the test suite against both browser targets.

## Side-loading a build

To try a build in your own browser instead of a dev profile:

```bash
pnpm --filter @my-links/extension build          # Chromium → .output/chrome-mv3
pnpm --filter @my-links/extension build:firefox  # Firefox  → .output/firefox-mv2
```

- **Chromium**: open `chrome://extensions`, enable _Developer mode_, click _Load unpacked_, and select `.output/chrome-mv3`.
- **Firefox**: open `about:debugging#/runtime/this-firefox`, click _Load Temporary Add-on_, and select `.output/firefox-mv2/manifest.json`.

A side-loaded build has its own extension id, which the instance refuses until it is listed in `EXTENSION_IDS`, see [Configuration](https://docs.mylinks.app/self-hosting/configuration#browser-extension).

## Generating the API types

The API client is typed from the webapp's OpenAPI document rather than by importing webapp source, which keeps the two TypeScript projects decoupled:

```bash
# from apps/webapp: refresh the route type registry (stop it once "tuyau: created api client registry" shows)
node ace serve

# from apps/webapp: writes .adonisjs/openapi.json
node ace openapi:generate

# from apps/extension: writes lib/api/schema.d.ts
pnpm run generate:api-types
```

Run this after any change to an API controller, validator or transformer. Request bodies come from the route registry, which only `node ace serve` rewrites, and only for controllers that call `request.validateUsing(...)` themselves: skip the first step and they silently drop out of the document.

## Browser quirks

- **MV2 has no `optional_host_permissions`**, so Firefox carries the optional origin in `optional_permissions` instead. Without it, self-hosted instances could never be connected.
- **Firefox needs a stable add-on id** (`browser_specific_settings.gecko.id`): `identity.getRedirectURL()` derives the callback subdomain from it, so every temporary install would otherwise hand the instance a different callback URL.
- Business logic lives in pure functions under `lib/`, and the browser APIs sit behind small interfaces (`bookmarks_api.ts`, `panel_api.ts`), so the test suite runs without a browser.

The other browser differences users run into are in the [user guide](https://docs.mylinks.app/guide/browser-extension#known-browser-differences).
