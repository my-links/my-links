# Browser extension

The official extension works against **any** MyLinks instance: the public one at [mylinks.app](https://www.mylinks.app) or your own self-hosted deployment. It targets Chromium (MV3) and Firefox (MV2) from a single source.

- A **side panel** (sidebar on Firefox) and a **new tab page** to browse, create and edit collections and links.
- **Quick capture** from the toolbar or the context menu, with duplicate detection.
- **Search**, reachable from anywhere with `Ctrl+Shift+K` (`Alt+Shift+K` on Firefox, rebindable in the browser).
- **Offline-tolerant**: the last sync is cached, stale data is flagged, an expired token asks for a reconnect instead of failing silently. The collections are refreshed every 5 minutes and when you switch tabs or focus a window.
- **Click counting**: opening a link from the extension goes straight to the target and records the click in the background, so it feeds the same ranking as a click in the webapp.
- **Optional bookmark mirroring**: two-way sync between your collections and the browser's native bookmarks (see [below](#bookmark-mirroring)).

## Installing

Install it from the store of your browser:

- **Chrome and other Chromium browsers**: [Chrome Web Store](https://chromewebstore.google.com/detail/my-links-extension/agkmlplihacolkakgeccnbhphnepphma)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/mylinks-extension/)

To try a build that is not in the stores yet, see [Side-loading a build](https://github.com/my-links/my-links/blob/main/apps/extension/README.md#side-loading-a-build).

## Connecting to an instance

1. Open the extension's options page.
2. Enter your instance URL (`https://mylinks.app`, or your own domain; development builds default to `http://localhost:3333`) and click **Connect**.
3. The browser asks for permission to access that origin. Self-hosted instances are arbitrary origins, so the permission is requested at runtime rather than being fixed in the extension.
4. You are sent to sign in on the instance, which then hands an API token back to the extension. The token travels in the URL fragment, so it never reaches any server.

**Disconnect** clears the token and every cached artifact, including the bookmark mapping: reconnecting may well be as a different account, and a stale mapping would point native bookmarks at the wrong one.

::: warning
Firefox blocks mixed content: an instance served over plain `http://` on a LAN address will not load from the extension. Serve it over HTTPS.
:::

## Bookmark mirroring

Off by default, turned on from the options page, which is also when the optional `bookmarks` permission is requested. Putting things on your bookmarks bar is not done behind your back.

Once on:

- Collections are mirrored into a single **Collections** folder kept at the front of the bookmarks bar, and favorites are pinned to the bar itself, ordered by how often you open them (recomputed daily, or when the set of favorites changes).
- The sync is **two-way**: renaming a folder renames the collection, dragging a bookmark between collection folders moves the link, dropping a bookmark into a collection folder saves it as a link, and starring a page adopts it.
- Only nodes the extension itself created are ever modified or deleted. Bookmarks you filed by hand are left alone, including ones inside a collection folder, and anything already on the bar before you enabled the mirror is never adopted.
- Turning it off stops the syncing and leaves everything in place. The options page can additionally remove the bookmarks MyLinks added (only the mapped ones).

## Privacy

The extension talks only to the instance you connected to and contacts no third party. Until you connect, it makes no network request at all. What it sends once connected is listed in [Privacy](/self-hosting/privacy#browser-extension).

## Permissions

| Permission                      | Why                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `storage`                       | Token, cached collections, mirror bookkeeping                                                             |
| `sidePanel` _(Chromium only)_   | The side panel. Added by the build from the side panel entry point; Firefox uses `sidebar_action` instead |
| `identity`                      | The auth handoff's callback URL                                                                           |
| `alarms`                        | Periodic background sync                                                                                  |
| `contextMenus`, `notifications` | Quick capture and its feedback                                                                            |
| `tabs`                          | Title and URL of the active tab for quick-add                                                             |
| `bookmarks` _(optional)_        | Requested only when bookmark mirroring is turned on                                                       |
| Host access _(optional)_        | Requested at runtime for the instance you connect to                                                      |

## Known browser differences

- **Firefox cannot focus its own sidebar.** The keyboard shortcut opens it, but the cursor does not jump into the search field: an extension may not steal focus into a sidebar it has just opened. Click the field once to select it.
- **CORS**: on Chromium, holding a host permission bypasses CORS entirely. On Firefox, requests go through ordinary cross-origin CORS, answered by the instance for `/api/v1/*`.
- **Firefox's background page is persistent**, where Chromium's MV3 service worker is suspended between events; the periodic sync alarm exists specifically to cover the Chromium case.
