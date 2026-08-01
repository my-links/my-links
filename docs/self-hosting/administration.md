# Administration

An administrator reaches `/admin`, which holds two tabs.

## Accounts

Lists every account with what it owns, whether its address was ever confirmed, how it can sign in, and when it last did. Four actions are available per account, all of them also reachable from the [console](/self-hosting/console-commands):

- Mail a reset link (only where outgoing mail is configured — otherwise `user:reset-password --link`)
- Mark an address confirmed
- Revoke every browser session and extension token
- Promote or demote

The same refusal applies as on the console: the last administrator of an instance cannot be demoted.

## Authentication journal

Shows what the instance's authentication log recorded — sign-ins, refusals, password and address changes, provider links, sudo confirmations — newest first, 50 at a time. An action an administrator took on somebody else's account names both the account and the administrator, so an admin action is never mistaken for something the owner did.
