# Account

## Signing in

An account signs in with a password, with Google, or with both; a self-hosted instance decides whether Google sign-in is offered by whether `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set (see [Authentication](/self-hosting/authentication)).

At least one sign-in method has to remain on an account at all times. You can add a password to a Google-only account, or link Google to a password account, but you cannot remove the last one: that refusal exists so no action from inside the settings page can lock you out of your own account.

## Changing your password

Setting a first password and replacing an existing one use the same form. Replacing a password signs out every other browser session and every extension token on the account, since a session that outlives a password change would defeat the point of changing it.

## Changing your email address

The address on your account is also where recovery links are sent, so changing it is a two-party confirmation: the new address has to confirm the change before it takes effect, and the current address is notified so you can cancel a change you did not make.

On an instance with no outgoing mail configured, the email address cannot be changed from the settings page; an operator can still do it with `node ace user:*`, see [Console commands](/self-hosting/console-commands).

## Sudo mode

Changing a password, changing an email address, or linking/unlinking a sign-in provider all sit behind **sudo mode**: a recent re-confirmation of who you are, separate from just having an active session. Reaching one of those actions without a recent confirmation redirects to a short prompt (re-enter your password, or reconfirm with Google) before continuing to what you were doing.

This is what stops a session left open on a shared or stolen device from being enough, on its own, to take over the account it belongs to.

## Sessions

The **Active sessions** list in your settings shows every browser signed in to your account: its IP address, its device (browser), when it was created, when it expires, and which one is the session you are looking at. Signing a session out revokes it immediately; signing out the current one logs you out of this browser. Sessions last seven days.

Changing your password, or deleting your account, signs out every other session as well.

## API tokens

The **API tokens** section of your settings creates the bearer tokens that other clients use to reach your data through the [REST API](/api/) and the [MCP server](/api/mcp). Each token has a name and an access level:

- **Full access** can read and write everything.
- **Read only** cannot create, edit or delete anything.

The secret is shown once, right after the token is created. Revoke a token from the same list whenever you no longer need it. The browser extension gets its own full access token, named _Browser extension_, when you connect it, see [Browser extension](/guide/browser-extension). Replacing your password revokes every token.

## Default page

The **Default page** preference in your settings decides where MyLinks opens after you sign in: your **Favorites** (which falls back to the **Inbox** while you have none) or your **Inbox**. It follows your account, unlike the language and theme, which apply to the device you set them on.

## Deleting your account

**Delete Account** in your settings does not erase anything right away. It starts a **30-day grace period**:

1. The account is disabled and every session and token on it is revoked, so you are signed out everywhere.
2. If the instance has outgoing mail configured, a confirmation email tells you the deletion was scheduled and that signing back in cancels it. Without mail, no email is sent.
3. When you sign in during the grace period, with your password or with Google, MyLinks asks whether to **reactivate** the account instead of opening a session. Confirming cancels the deletion and signs you in; declining keeps the deletion scheduled and returns you to the sign-in page.
4. Once the 30 days have passed, a daily maintenance sweep permanently deletes the account and everything in it. There is no way back after that.

### Inactive accounts

An account that has not been seen for **365 days** (counted from its creation if it never signed in) is put through the same grace period automatically, with the same email where mail is configured, worded as an inactivity notice. Signing back in during the grace period offers the same reactivation. Administrator accounts are never flagged.

### Deletion by an administrator

When an administrator deletes an account, the same grace period applies, with two differences: no email is sent, and signing in does not offer reactivation, with a password or with Google (the sign-in is refused like any other failed attempt, without saying why). Only an administrator can restore the account, see [Administration](/self-hosting/administration#deleting-and-restoring-accounts).
