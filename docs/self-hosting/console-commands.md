# Console commands

Everything the settings pages do to an account, an operator with a shell can do too — which is what keeps an instance with no outgoing mail recoverable. Every command runs from `apps/webapp`.

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

Passwords are only ever asked for, never read from a flag — an argument would sit in the shell history and in the process list of every user on the machine. Deleting an account likewise always asks for its address to be retyped; there is no flag to skip that, and nothing here can undo it.

Two refusals are deliberate. A provider cannot be unlinked when it is the only way into the account, and the last administrator of an instance cannot be demoted — both would produce a state no page in the interface can repair.
