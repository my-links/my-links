# Changelog

Highlights from major MyLinks releases, written for people using the app rather than reading commit history. For the full technical log of every release, see the [webapp](https://github.com/my-links/my-links/blob/main/apps/webapp/CHANGELOG.md) and [extension](https://github.com/my-links/my-links/blob/main/apps/extension/CHANGELOG.md) changelogs on GitHub.

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
