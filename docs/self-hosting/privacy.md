# Data & privacy

What a MyLinks instance stores, who can see it and for how long. The in-app privacy policy (linked in the footer) tells members the same story from their side.

## Inventory

| Data                                                                       | Where stored                         | Who can see it                                              | Retention                                                          |
| -------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| Email, name or nickname, created and updated dates                         | `users` table                        | Owner. Admin (email searchable, not displayed in the table) | Until the account is deleted                                       |
| Password hash, linked Google ID                                            | Database                             | Nobody in clear. Admin sees the sign-in methods only        | Until the account is deleted                                       |
| Last seen                                                                  | `users` table                        | Owner. Admin                                                | Written at most every 5 minutes, kept until the account is deleted |
| Collections (name, description, icon, visibility) and links                | Database                             | Owner. Anyone for a public or shared collection (see below) | Until deleted by the owner or with the account                     |
| Public collection exposure                                                 | Web pages, API, MCP                  | Anonymous visitors, followers                               | Hidden while the owner's account is pending deletion               |
| Click counter and last click time per link                                 | Database                             | Owner (totals only)                                         | Until the link is deleted                                          |
| Favorites                                                                  | Database                             | Owner only                                                  | Until deleted                                                      |
| Follows                                                                    | Database                             | Owner. The followers count is public                        | Until unfollowed or the account is deleted                         |
| Sessions (with IP and user agent)                                          | Database session store               | Owner on their sessions page                                | Expire after 7 days                                                |
| Authentication journal (IP, user agent, event type, account, time)         | Database                             | Admin, with the IP masked                                   | IP and user agent erased after 180 days, the event row is kept     |
| Activity journal (what was done, ids and counts, IP)                       | Database                             | Admin, with the IP masked                                   | Rows pruned after 90 days                                          |
| One-time tokens (verification, reset, email change) and expired API tokens | Database                             | Nobody                                                      | Purged a day after expiry or use                                   |
| Rate limiting counters                                                     | Keyed by IP or an HMAC of the email  | Nobody                                                      | Transient                                                          |
| Favicons and favicon failures, per origin                                  | Database and disk, no link to a user | Anyone: `/favicon` is public and answers per origin         | Purged nightly when no link references the origin                  |
| Server logs                                                                | Process output                       | Operator                                                    | See [Logging](/self-hosting/configuration#logging)                 |

## Public and shared collections

Anonymous visitors, followers, the API and the MCP server see the collection name, description, icon and visibility, its links (URL, name, description, timestamps), the author id and display name (nickname or name) and the followers count.

They never see the owner's email, admin status or favorites, click counts, last click time, or any other collection of the owner.

## What admins can and cannot see

Admins see, per account: the email (searchable, not displayed in the table), sign-in methods, counts of collections and links, created, last seen and last sign-in dates. They also read the journals, with IPs masked to /24 for IPv4 and /48 for IPv6.

Admins never see another user's links, URLs, domains, collection names or search terms. See [Administration](/self-hosting/administration).

## Outbound requests

The server only makes these requests:

- Favicon fetches for bookmarked links
- Google OAuth, if enabled
- SMTP, if configured

There is no analytics, no error tracking, no update check and no CDN at runtime. Fonts are bundled at build time (fetched from `fonts.bunny.net` during the build only). The application sends `Referrer-Policy: same-origin` and a deny-all `Permissions-Policy`, and outbound links use `rel="noreferrer"`.

## Favicons

For each bookmarked link, the server fetches the origin root (never the path) from the instance's IP address, with browser TLS fingerprint impersonation. No third-party favicon service is involved, and browsers load favicons only through the instance.

Results are stored per origin in `favicon_entries` and `favicon_failures`, with no link to a user. Both are purged nightly once no link references the origin any more.

## Journals and retention

- **Authentication journal**: sign-ins, refusals, password and address changes, provider links and sudo confirmations. It stores the IP and user agent. They are erased after 180 days, while the event row (type, account, time) is kept as security evidence. Rows survive account deletion, detached from any account.
- **Activity journal**: what members did (create, edit and delete collections and links, follow, import and export, deletion requests). Ids and counts only, never content. Rows are pruned after 90 days.
- **Click counting**: a counter and a last click time per link. No IP, user agent, referrer or per-visit record. The owner sees totals only.

## Account deletion

An account enters a 30-day grace period when the member requests deletion, after 365 days of inactivity (non-admins only) or when an admin requests it. When the period ends, the user and everything they own are hard deleted (cascade). A data export is available in the settings beforehand. Only the detached authentication journal rows described above remain.

## Browser extension

The extension syncs collections only when connected with a token. It sends a link only when the member saves it, and reports visits of saved links opened from the extension. The optional bookmark mirror uploads bookmarks from the bookmarks bar saved after enabling it, and bookmarks added to collection folders.

It asks for an optional host permission for the instance only and an optional bookmarks permission. It has no content scripts and no third-party service.

## Logs

See the [Logging](/self-hosting/configuration#logging) section of the configuration page.
