# Administration

An administrator reaches `/admin`, which is split into five sections, switched from the tabs at the top of the page.

| Section                                           | What it shows                                                   |
| ------------------------------------------------- | --------------------------------------------------------------- |
| [Accounts](#accounts)                             | Every account, with the actions an administrator can take on it |
| [Authentication journal](#authentication-journal) | Sign-ins, refusals, password and address changes                |
| [Activity journal](#activity-journal)             | What members did to their collections, links and data           |
| [Status](#status)                                 | Whether the instance is healthy                                 |
| [Favicons](#favicons)                             | The favicon store and its maintenance                           |

## Accounts

The landing page of the admin area. Three counters sit on top (users, collections, links on the whole instance), above a searchable table of every account with what it owns, whether its address was ever confirmed, how it can sign in, when it was created, last seen and last signed in.

Per account, from the actions column, all of them also reachable from the [console](/self-hosting/console-commands) where it matters:

- Mail a reset link (only where outgoing mail is configured, otherwise `user:reset-password --link`)
- Mark an address confirmed
- Revoke every browser session and extension token
- Promote or demote
- Delete the account

The same refusal applies as on the console: the last administrator of an instance cannot be demoted.

### Deleting and restoring accounts

Deleting an account, one at a time or with the checkboxes and **Delete selected** for several, does not wipe it on the spot. It starts the same 30-day grace period as a self-service deletion: the account is disabled, every session and token it holds is revoked, and a **Pending deletion** badge appears in the table. Administrator accounts are never a valid target.

During the grace period:

- The owner **cannot cancel it by signing back in**, since an administrator's decision must not be reversible by the account it targets. No notification is mailed either.
- An administrator can cancel it with the restore action on the row, which brings the account back as it was.

Once the grace period has run out, the daily maintenance sweep permanently deletes the account and everything it owns, see [Console commands](/self-hosting/console-commands#maintenance). A deletion the owner requested, or that the inactivity sweep started, can be undone by the owner signing back in, see [Your account](/guide/account).

## Authentication journal

Shows what the instance's authentication log recorded (sign-ins, refusals, password and address changes, provider links, sudo confirmations), newest first, 50 at a time. An action an administrator took on somebody else's account names both the account and the administrator, so an admin action is never mistaken for something the owner did.

Authentication rows are security evidence and are never pruned.

## Activity journal

Shows what members and administrators did to collections, links and account data: creating, editing and deleting collections and links, following and unfollowing, imports and exports, account deletion requests and reactivations. Never what a collection or a link contained. Newest first, 50 at a time, and an administrator's action names both parties like in the authentication journal.

Rows older than 90 days are pruned by the daily `activity:prune` sweep, see [Console commands](/self-hosting/console-commands#maintenance).

## Status

Runs the instance's health checks (disk space and memory heap) when the page loads and reports the overall result and each check's detail. The unauthenticated [health endpoint](/api/health) exposes the overall result for monitoring.

## Favicons

Three counters (stored favicons, store size, resolution failures), the 100 most recent resolution failures with the origin, the reason, the number of attempts and the time of the last one, and the maintenance actions:

- **Purge orphaned entries**: deletes the cached favicons no link refers to any more, and the stored image files no cached favicon uses. The same as the `favicon:purge-orphans` sweep.
- **Re-resolve failures**: retries every origin that failed to resolve. A success clears its failure row, a repeat failure stays recorded.
- **Re-resolve all**: re-scrapes every known origin. Nothing is deleted first, so links keep their current icon until the new one lands.
- **Flush store**: deletes every stored favicon and every recorded failure. Links resolve their icon again the next time they are viewed.
