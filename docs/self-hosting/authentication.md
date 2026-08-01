# Authentication

An account signs in with a password, with Google, or with both. Google sign-in is available whenever `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set — see [Configuration](/self-hosting/configuration#google-sign-in).

## Registration policy

`ALLOW_REGISTRATION` decides whether `/register` accepts new accounts.

| Value    | Effect                                                                 |
| -------- | ---------------------------------------------------------------------- |
| unset    | Open until the first account exists, closed afterwards                 |
| `open`   | Anyone can create an account                                           |
| `closed` | `/register` is refused; accounts are added with `node ace user:create` |

Left unset, the instance answers for itself: **open until it has its first account, closed from then on.** That first account becomes the administrator, whichever method created it — the registration form or Google sign-in. A freshly deployed instance therefore lets you in without any configuration, and stops being an open sign-up form the moment you are in.

A submitted address is never confirmed or denied: registering with an address that already has an account produces exactly the response a free address produces, and no email is sent. That is what keeps the form from becoming a way to find out who has an account here.

If [outgoing mail](/self-hosting/configuration#outgoing-mail) is configured, a new account receives a confirmation link valid for 24 hours. Without it, no link is issued and no feature is gated behind an unconfirmed address.

## Sign-in methods

At least one sign-in method has to remain on an account at all times — a provider cannot be unlinked when it is the only way in. A password change or a provider link/unlink both require [sudo mode](/guide/account#sudo-mode), a recent re-confirmation of identity.
