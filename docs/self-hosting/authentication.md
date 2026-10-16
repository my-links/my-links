# Authentication

An account signs in with a password, with Google, or with both. Google sign-in is available whenever `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set; see [Configuration](/self-hosting/configuration#google-sign-in).

## Registration policy

`ALLOW_REGISTRATION` decides whether `/register` accepts new accounts.

| Value    | Effect                                                                 |
| -------- | ---------------------------------------------------------------------- |
| unset    | Open until the first account exists, closed afterwards                 |
| `open`   | Anyone can create an account                                           |
| `closed` | `/register` is refused; accounts are added with `node ace user:create` |

Left unset, the instance answers for itself: **open until it has its first account, closed from then on.** A freshly deployed instance therefore lets you in without any configuration, and stops being an open sign-up form the moment you are in. Who becomes the administrator is a separate question, see [First administrator](#first-administrator).

A submitted address is never confirmed or denied: registering with an address that already has an account produces exactly the response a free address produces, and no email is sent. That is what keeps the form from becoming a way to find out who has an account here.

If [outgoing mail](/self-hosting/configuration#outgoing-mail) is configured, a new account receives a confirmation link valid for 24 hours. Without it, no link is issued and no feature is gated behind an unconfirmed address.

## First administrator

Being first to reach a new instance is not enough to own it. While the instance has no administrator, a registration only becomes one when it carries the **setup token**; any other registration creates a regular account.

- Set `ADMIN_SETUP_TOKEN` (at least 32 characters) in the environment to choose the token yourself, or leave it unset.
- Left unset, a random token is generated at every boot, and as long as no administrator exists the logs print one line with the full link, `<APP_URL>/auth/register?setup_token=<token>`. This is the one place a secret is logged on purpose: open that link and register, and the form carries the token for you.
- Once an administrator exists the token is ignored, and the log line is no longer printed.
- A wrong or missing token never fails a registration, it just does not grant the role. Google sign-in never grants it either: register through the setup link, or promote the account afterwards with `node ace user:set-role`.

If someone else registered first, promote the right account from the console with `node ace user:set-role <email> --role=administrator`, or create it with `node ace user:create <email> --admin`. See [Console commands](/self-hosting/console-commands).

## Sign-in methods

At least one sign-in method has to remain on an account at all times: a provider cannot be unlinked when it is the only way in. A password change or a provider link/unlink both require [sudo mode](/guide/account#sudo-mode), a recent re-confirmation of identity.
