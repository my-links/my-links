# Console commands

Everything the settings pages do to an account, an operator with a shell can do too, which is what keeps an instance with no outgoing mail recoverable. Every command runs from `apps/webapp`.

| Command                | What it does                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| `user:create`          | Opens an account, regardless of `ALLOW_REGISTRATION`                       |
| `user:list`            | Lists the accounts, with `--admin`, `--unverified` and `--provider=google` |
| `user:reset-password`  | Writes a new password, or prints a single-use reset link with `--link`     |
| `user:set-role`        | Promotes to administrator or demotes to member                             |
| `user:verify-email`    | Marks an address as confirmed                                              |
| `user:unlink-provider` | Detaches a sign-in provider                                                |
| `user:delete`          | Deletes an account and everything it owns                                  |

Every command takes the address as an argument and asks for whatever is missing, so each one is usable both from a script and by hand:

```bash
node ace user:create ada@example.com --name="Ada Lovelace" --admin
node ace user:reset-password ada@example.com --link
node ace user:list --unverified
```

Passwords are only ever asked for, never read from a flag: an argument would sit in the shell history and in the process list of every user on the machine. Deleting an account likewise always asks for its address to be retyped; there is no flag to skip that, and nothing here can undo it.

Two refusals are deliberate. A provider cannot be unlinked when it is the only way into the account, and the last administrator of an instance cannot be demoted; both would produce a state no page in the interface can repair.

## Maintenance

These sweeps are meant to run on a schedule, not by hand. The application schedules them itself, in your timezone (`TZ`, `UTC` by default), whenever the web process runs, on Docker and on a native `pnpm run start`. A system cron is only needed if the scheduler preload is disabled or the web process is not used, see [Docker & compose](/self-hosting/docker#native-deployment). From `build/`, run them as `node bin/console.js <command>`.

| Command                         | Schedule (Docker) | What it does                                                                                                                                                         |
| ------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `account:flag-inactive`         | daily, 03:00      | Starts the deletion grace period of every member account unseen for 365 days (counted from creation for an account that never signed in). Administrators are skipped |
| `account:prune-deleted`         | daily, 03:30      | Permanently deletes the accounts whose 30-day grace period has run out, with everything they own                                                                     |
| `favicon:purge-orphans`         | daily, 04:00      | Deletes the cached favicons and recorded resolution failures no link refers to any more, and the stored image files no cached favicon uses                           |
| `activity:prune`                | daily, 04:30      | Deletes activity journal rows older than 90 days                                                                                                                     |
| `auth-events:anonymize-origins` | daily, 05:00      | Erases the IP and user agent of authentication journal rows older than 180 days. The rows themselves are kept                                                        |
| `token:prune-stale`             | daily, 05:30      | Deletes one-time tokens (verification, reset, address change) and API tokens a day after they expired or were used                                                   |

`activity:prune` only touches the activity journal (what members and administrators did to collections, links and account data). Authentication rows are security evidence and are kept: only their IP and user agent are erased, after 180 days.
