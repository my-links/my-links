# Changelog

Every release with changes you can notice, written for people using or hosting the app rather than reading commit history. Breaking changes are flagged. For the full technical log of every release, see the [webapp](https://github.com/my-links/my-links/blob/main/apps/webapp/CHANGELOG.md) and [extension](https://github.com/my-links/my-links/blob/main/apps/extension/CHANGELOG.md) changelogs on GitHub.

## 5.6.1 (October 28, 2026)

### Self-hosting

- The setup link logged at boot on a new instance opens the registration page. It pointed to a page that does not exist.
- With Docker Compose, the app always listens on port `3333` inside its container, and `PORT` only sets the port published on the host. A `PORT` other than `3333` in `.env` made the instance unreachable.
- `.env.example` leaves `ALLOW_REGISTRATION` unset, so an instance built from it keeps sign-up closed until you open it. An `.env` copied from an older `.env.example` still says `open`: remove that line unless you want open sign-up.

## 5.6.0 (October 23, 2026)

### Breaking changes

- `GET /l/:id` no longer redirects to the link. Opening a link now goes straight to its target and a `POST /l/:id` beacon records the click in the background. Anything that linked to `/l/:id` (bookmarks, scripts) must use the link's own URL, and clients that recorded clicks through that route should use [`POST /api/v1/links/:id/visits`](/api/links#record-a-visit).

### Upgrading

Earlier versions wrote email addresses on every authentication event and link URLs on every favicon failure, at levels that are always on, and the Docker image defaulted to `debug`. Upgrading changes what gets written from now on, not what is already stored:

- Check `LOG_LEVEL` in your `.env`: an `.env` copied from an older `.env.example` still says `debug`. Set it to `info`.
- Drop the old output. With Docker Compose, `docker compose -f compose.image.yml up -d --force-recreate my-links` starts a fresh container and discards the previous one's log. The `postgres` container's log can hold email addresses too, in constraint violation details: recreate it the same way.
- If you ship logs to another service, delete or let expire what it received before the upgrade, according to its own retention settings.

### Security

- The Docker image now runs Node.js 26.12.1, which fixes the October 2026 Node.js security vulnerabilities. Rebuild or pull the new image.
- On a new instance, sign-up is reserved for the setup link logged at boot until an administrator exists, unless `ALLOW_REGISTRATION=open` is set, so being first to reach it is not enough to own it. See [Authentication](/self-hosting/authentication#first-administrator).
- Logs no longer contain email addresses or link URLs, and admin journals mask IP addresses. The IP and user agent of authentication events are erased after 180 days.
- API tokens expire and can revoke themselves, and the extension revokes its token when you disconnect.
- Sign-up, password reset and email change answer in the same time whether or not an account exists, and sign-in throttling counts only failed attempts.
- Favicon fetching is hardened against internal addresses and oversized responses.

### Links and collections

- Only your own clicks count toward a link's ranking, and clicks no longer change the link's last-modified date.
- Drag a collection between the public and private sections of the sidebar. Changing a collection's visibility in a way that exposes links asks for confirmation first.
- Large favicons are downscaled, and sites that block plain server requests are fetched with a browser-like identity.

### Self-hosting

- Trusted reverse proxies are configurable with `TRUSTED_PROXIES`, see [Configuration](/self-hosting/configuration#reverse-proxy).
- Requests slower than 500 ms are logged, and every response carries a `Server-Timing` header.
- Activity journal pruning and stale token cleanup run on a schedule.
- The token check returns the token owner's id.

## 5.5.0 (October 6, 2026)

### Links and collections

- Favicons are fetched once when a link is saved and stored on disk, so pages load them instantly. Sites without an icon show a local monogram. You can refresh a link's favicon by hand.
- Link URLs up to 8192 characters are accepted.
- Choose your default landing page in the settings. With no favorites, the app opens on the Inbox.

### Admin

- A new admin page shows the favicon store and lets you re-resolve failures.

### Self-hosting

- Mount `/app/storage/favicons` as a persistent volume, see [Docker & compose](/self-hosting/docker).

## 5.4.0 (September 4, 2026)

### API and integrations

- A built-in MCP server lets AI assistants read your links, collections, favorites and search results, see [MCP server](/api/mcp).
- API tokens are created with a `read_only` or `full_access` scope, see [Tokens](/api/tokens#scopes).

### Accounts

- Rename your display name from the settings.

### Improved

- Link URLs that are not `http` or `https` are rejected, and exports reconcile links with their collections reliably.
- Links saved with a `www.` prefix keep it.

## 5.3.0 (August 16, 2026)

### Self-hosting

- Scheduled account maintenance runs inside the app instead of in a separate scheduler container. Remove the old container from your compose file.

## 5.2.0 (August 16, 2026)

### Accounts

- Delete your account with a 30-day grace period and a confirmation email. Inactive accounts are flagged and deleted automatically, and administrators can start or cancel a deletion.
- The settings gain preferences and about sections.

### Interface

- A new app layout with an account menu, search in the sidebar, a sidebar that collapses to an icon rail, and a keyboard shortcuts modal.
- The shared collection page has its own layout without the app chrome.
- Search shows your recent links when the query is empty.
- Collections and links refresh when you return to the tab.

### Self-hosting

- A pull-based compose file runs the published image directly, see [Docker & compose](/self-hosting/docker). The `.env` file now lives at the repository root.
- Logging out is a POST request, so CSRF protection applies.

## 5.1.0 (August 12, 2026)

### Links and collections

- Every account gets an Inbox, pinned beside Favorites. Its visibility cannot be changed by mistake.
- Deleting a collection shows how many links it holds, and collections show their follower count.
- Link grid columns adapt to the available space.

### Interface

- Toasts replace plain flash messages, and can be dismissed.
- The admin logs show avatars and display names instead of emails.
- Sessions and API tokens show their creation date.

### Browser extension

- A manual refresh button, an optional new tab override, the Inbox pinned above the sortable sections, and a link count when confirming a collection deletion.

## 5.0.0 (August 7, 2026)

### Accounts and sign-in

- Sign in with email and password, in addition to Google.
- Registration is open, with an email confirmation step before the first sign-in.
- Link or unlink sign-in methods on your account, and move it to a new email address.
- Changing your password now happens behind a short re-authentication step.
- Review your active sessions from account settings, spot the one you're on, and sign other devices out. Revoking your own session signs you out immediately.

### Links and collections

- Save a link to several collections at once, or to none at all. Links with no collection land in Inbox.
- Links that belong to more than one collection are badged so you can spot them.
- Drag and drop to reorder collections and links, or move a link straight into another collection. Your order is saved and shows up everywhere, including the extension.
- Inbox is now implicit and read-only, so it can't be renamed or deleted by mistake.
- Search for a collection from the link form instead of scrolling the list.
- Importing accepts the older nested-links export format again, and no longer rejects very long URLs.

### Organize your sidebar

- Reorder sidebar sections and pin Favorites to the top. Which sections you collapse sticks between visits.
- Add a link, or create a collection, straight from the sidebar without opening a collection first.
- Followed collections always have their own section.
- The Inbox collection has its own distinct icon.

### Sharing

- Follow and unfollow a shared collection right from its shared page.
- Admins can see who's following each collection from the users table.

### Search

- Dashboard and extension search moved client-side, so results are instant and tolerate typos.

### Browser extension

- Sidebar rebuilt on the same design system as the app, with quick-add, search, and full create, edit and delete.
- Mirror your collections into native browser bookmarks, in both directions, order included. A bookmark you drop on the bar becomes a favourite.
- Pin favourites to your bookmarks bar, ranked by how often you open them.
- Reorder collections, links and sidebar sections by drag and drop, and move links between collections.
- Collapse or expand the whole tree at once, or shift-click a collection to toggle its children.
- Right-click context menus on links and collections, plus quick-add from the page context menu.
- Open search from anywhere with a keyboard shortcut.
- New tab pages now open your collections instead of the browser default.
- Followed collections now appear in the panel.
- A badge tells you when data is stale, and says so plainly when your session has expired.
- Now available on Firefox.

### Getting started

- A guided tour walks new users through the dashboard on first visit.
- The homepage was redesigned around how you actually use MyLinks, and signed-in visitors go straight to their dashboard.
- Major releases are announced in a dismissible banner.

### Admin

- New activity journal tracks what happened to accounts, collections and links, with a retention command to prune it.
- See how each account signs in, and manage accounts from the command line.
- Non-admins are told why they were turned away instead of hitting a blank wall.

### Self-hosting

- Google sign-in is now optional, and outgoing email is an optional capability. Email confirmation is only required where mail is configured.
- The public API is rate limited, ships a generated OpenAPI spec, and returns real errors instead of placeholders.
- Security hardening: content security policy and clickjacking protection, tighter favicon URL validation, Postgres no longer bound to every interface, and the app version is no longer exposed on the health endpoint.
- Docker deployments use the database session store, so sessions survive a restart.

### Improved

- The dashboard and admin pages are more usable on mobile.
- Missing and incorrect French translations fixed throughout.
- Many smaller fixes to forms, modals, favicons and the sharing flow.
