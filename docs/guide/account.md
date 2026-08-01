# Account

## Signing in

An account signs in with a password, with Google, or with both — a self-hosted instance decides whether Google sign-in is offered by whether `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set (see [Authentication](/self-hosting/authentication)).

At least one sign-in method has to remain on an account at all times. You can add a password to a Google-only account, or link Google to a password account, but you cannot remove the last one — that refusal exists so no action from inside the settings page can lock you out of your own account.

## Changing your password

Setting a first password and replacing an existing one use the same form. Replacing a password signs out every other browser session and every extension token on the account, since a session that outlives a password change would defeat the point of changing it.

## Changing your email address

The address on your account is also where recovery links are sent, so changing it is a two-party confirmation: the new address has to confirm the change before it takes effect, and the current address is notified so you can cancel a change you did not make.

On an instance with no outgoing mail configured, the email address cannot be changed from the settings page — an operator can still do it with `node ace user:*`, see [Console commands](/self-hosting/console-commands).

## Sudo mode

Changing a password, changing an email address, or linking/unlinking a sign-in provider all sit behind **sudo mode**: a recent re-confirmation of who you are, separate from just having an active session. Reaching one of those actions without a recent confirmation redirects to a short prompt — re-enter your password, or reconfirm with Google — before continuing to what you were doing.

This is what stops a session left open on a shared or stolen device from being enough, on its own, to take over the account it belongs to.
