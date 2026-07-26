# MyLinks browser extension

The official MyLinks browser extension, built with [WXT](https://wxt.dev) and React.
It talks to any MyLinks instance — the public one or a self-hosted deployment —
over the REST API documented in [`docs/api.md`](../../docs/api.md).

Targets **Chromium (MV3)** and **Firefox (MV2)** from the same source.

## Table of Contents

- [Features](#features)
- [Installing a development build](#installing-a-development-build)
- [Connecting to an instance](#connecting-to-an-instance)
- [Bookmark mirroring](#bookmark-mirroring)
- [Development](#development)
  - [Commands](#commands)
  - [Generating the API types](#generating-the-api-types)
  - [Project layout](#project-layout)
- [Permissions](#permissions)
- [Known browser differences](#known-browser-differences)

## Features

- **Side panel workspace**: browse, create, edit and delete collections and links
  without leaving the page you are on. Chromium gets a side panel, Firefox gets a
  sidebar; both open by clicking the toolbar icon (clicking again closes it).
- **New tab page**: the same workspace, as the new tab override.
- **Quick capture**: a quick-add button in the panel, plus context menu entries to
  save the current page, a link under the cursor, or the current selection. A page
  that is already saved is reported instead of being duplicated.
- **Search**: search collections and links from the panel, reachable from anywhere
  with `Ctrl+Shift+K` (`Alt+Shift+K` on Firefox, rebindable in the browser).
- **Works offline**: the last successful sync is cached, so reopening the panel
  never shows a blank screen. A badge flags stale data, and an invalid token asks
  for a reconnect instead of retrying forever.
- **Background sync**: the delta feed (`GET /api/v1/sync`) is polled every 5 minutes
  and on wake triggers (tab switch, window focus), deduped to a single in-flight
  request, with exponential backoff on failure.
- **Bookmark mirroring** (opt-in): two-way sync between your collections and the
  browser's native bookmarks — see [below](#bookmark-mirroring).
- **Click tracking**: opening a link from the extension goes through the instance's
  `/l/:id` redirect, so it feeds the same ranking as a click in the webapp.

## Installing a development build

The extension is not published to the stores yet. Build it, then side-load it.

```bash
pnpm --filter @my-links/extension build          # Chromium → .output/chrome-mv3
pnpm --filter @my-links/extension build:firefox  # Firefox  → .output/firefox-mv2
```

- **Chromium**: `chrome://extensions` → enable _Developer mode_ → _Load unpacked_ →
  select `.output/chrome-mv3`.
- **Firefox**: `about:debugging#/runtime/this-firefox` → _Load Temporary Add-on_ →
  select `.output/firefox-mv2/manifest.json`.

For an auto-reloading browser instance during development, use `pnpm run dev` /
`pnpm run dev:firefox` (see [Commands](#commands)).

## Connecting to an instance

1. Open the extension options page.
2. Enter your instance URL (defaults to `http://localhost:3333` in dev builds and
   `https://mylinks.app` otherwise) and click **Connect**.
3. The browser asks for permission to access that origin — self-hosted instances are
   arbitrary origins, so the host permission is requested at runtime rather than
   being pinned in the manifest.
4. You are sent to `/extension/authorize` on the instance, which creates an API token
   named _Browser extension_ and hands it back through the extension's callback URL.
   The token travels in the URL fragment, so it never reaches any server.

**Disconnect** clears the token and every cached artefact, including the bookmark
mapping — reconnecting may well be as a different user, and a stale mapping would
point native bookmarks at another account's entities.

> Firefox blocks mixed content: an instance served over plain `http://` on a LAN
> address will not load from the extension. Serve it over HTTPS.

## Bookmark mirroring

Off by default; turned on from the options page, which is also when the optional
`bookmarks` permission is requested. Putting things on someone's bookmarks bar is
not done behind their back.

Once on:

- Collections are mirrored into a single **`Collections`** folder kept at the front
  of the bookmarks bar, and favourites are pinned to the bar itself, ordered by how
  often you open them (recomputed daily, or when the set of favourites changes).
- The sync is **two-way**: renaming a folder renames the collection, dragging a
  bookmark between collection folders moves the link, dropping any bookmark into a
  collection folder saves it as a link, and starring a page adopts it.
- Only nodes the extension itself created are ever modified or deleted. Bookmarks you
  filed by hand — including ones inside a collection folder — are left alone, and
  anything already on the bar before you enabled the mirror is never adopted.
- Reconciliation is a **three-way merge** between the browser tree, the server and a
  snapshot of the last agreed state, so a pass can tell which side actually changed
  instead of merely seeing that the two differ.
- Turning it off stops the syncing and leaves everything in place. The options page
  additionally offers to remove the bookmarks MyLinks added, which removes only
  mapped nodes.

## Development

The webapp must be running for the extension to have anything to talk to — see the
[root README](../../README.md#running-the-project-in-development).

### Commands

Run from this directory, or from the repository root with
`pnpm --filter @my-links/extension <script>`.

| Command                            | What it does                                                |
| ---------------------------------- | ----------------------------------------------------------- |
| `pnpm run dev`                     | Chromium dev build in a throwaway browser profile, with HMR |
| `pnpm run dev:firefox`             | Same, targeting Firefox MV2                                 |
| `pnpm run build` / `build:firefox` | Production build into `.output/`                            |
| `pnpm run zip` / `zip:firefox`     | Store-ready archive                                         |
| `pnpm run test`                    | Vitest suite against the Chromium target                    |
| `pnpm run test:firefox`            | The same suite against the Firefox target                   |
| `pnpm run typecheck`               | `tsc --noEmit`                                              |
| `pnpm run check`                   | `typecheck` + both test targets                             |
| `pnpm run generate:api-types`      | Regenerate the typed API client from the OpenAPI document   |

### Generating the API types

The API client is typed from the webapp's OpenAPI document rather than by importing
webapp source, which keeps the two TypeScript projects decoupled:

```bash
# from apps/webapp — writes .adonisjs/openapi.json
node ace openapi:generate

# from apps/extension — writes lib/api/schema.d.ts
pnpm run generate:api-types
```

Run this after any change to an API controller, validator or transformer.

### Project layout

```
entrypoints/     background worker, sidepanel, newtab and options pages
components/      React components, grouped by feature
hooks/           TanStack Query hooks over the API client
lib/api/         typed API client (openapi-fetch) + generated schema
lib/bookmarks/   the bookmark mirror: merge, plan, apply, teardown
lib/sync/        delta sync, backoff and status
lib/search/      search command and focus plumbing
lib/panel/       cross-browser side panel / sidebar abstraction
lib/storage.ts   every persisted key, documented in place
```

Business logic lives in pure functions under `lib/` and is tested directly; the
browser APIs sit behind small interfaces (`bookmarks_api.ts`, `panel_api.ts`) so the
suite runs without a browser.

## Permissions

| Permission                      | Why                                                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `storage`                       | Token, cached collections, mirror bookkeeping                                                                  |
| `identity`                      | The auth handoff's callback URL                                                                                |
| `alarms`                        | The periodic sync                                                                                              |
| `contextMenus`, `notifications` | Quick capture and its feedback                                                                                 |
| `tabs`                          | Title and URL of the active tab for quick-add (the panel outlives a tab switch, so `activeTab` would go stale) |
| `bookmarks` _(optional)_        | Requested only when bookmark mirroring is turned on                                                            |
| Host access _(optional)_        | Requested at runtime for the instance you connect to                                                           |

## Known browser differences

- **Firefox cannot focus its own sidebar.** The keyboard shortcut opens the sidebar,
  but the cursor does not jump into the search field — an extension may not steal
  focus into a sidebar it has just opened. The field is selected on first click.
- **MV2 has no `optional_host_permissions`**, so Firefox carries the optional origin
  in `optional_permissions` instead. Without it, self-hosted instances could never be
  connected.
- **Firefox needs a stable add-on id** (`browser_specific_settings.gecko.id`):
  `identity.getRedirectURL()` derives the callback subdomain from it, so every
  temporary install would otherwise hand the instance a different callback URL.
- **CORS**: Chromium extension pages holding a host permission bypass CORS entirely;
  Firefox issues ordinary cross-origin requests, so the instance answers them itself
  for `/api/v1/*` (credentials off, bearer token only).
- **Firefox's background page is persistent**, where Chromium's MV3 service worker is
  suspended between events — the sync alarm is the fallback for the latter.
