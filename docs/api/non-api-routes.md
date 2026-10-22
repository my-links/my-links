# Non-API routes

These routes live outside `/api/v1` but are part of the contract clients rely on.

## Click beacon

Counts a click on a link without redirecting. Clicks feed the ranking the extension uses when it pins favorites to the bookmarks bar.

**Endpoint:** `POST /l/:id`

**Authentication:** none required, but it needs a CSRF token. A session, when present, is resolved, and only the owner's clicks are counted.

**Response:** `204 No Content`. An unknown or non-visitable link id answers not found.

Rate-limited like the API (see [Rate limiting](/api/#rate-limiting)), sharing its bucket and falling back to the client IP when there is no user.

## Favicon proxy

**Endpoint:** `GET /favicon?url=<encoded-target-url>`

Returns the favicon for a target URL, so clients do not have to reach out to third-party origins themselves.

**Authentication:** none required.

**Query parameters:**

- `url` (optional): The page whose favicon is wanted. When it is missing, the default icon is returned.

**Response:** the image, with its `Content-Type`. While the icon is still being resolved, a placeholder is served with `Cache-Control: no-store` so the real icon replaces it on the next request. Otherwise the image is served with `Cache-Control: public, max-age=604800` (one week).

Rate-limited like the link redirect, in the same bucket (see [Rate limiting](/api/#rate-limiting)): the route is public and triggers outbound requests, so it needs the same protection.

## Extension authorization handoff

Mints an API token for the browser extension and hands it back to the browser.

**Endpoint:** `GET /extension/authorize?redirect_uri=<extension-callback-url>`

**Authentication:** the user's session. This is a browser navigation, not an API call. An unauthenticated visitor goes through the normal login flow first.

**Behavior:**

1. `redirect_uri` is validated against the browser-reserved callback shapes (`https://<id>.chromiumapp.org/*` for Chromium, `https://<sha1>.extensions.allizom.org/*` for Firefox). Anything else is refused: this is what stops the endpoint from minting a token for an arbitrary third-party origin.
2. A token named `Browser extension` is created for the signed-in user.
3. The response redirects to `redirect_uri` with `#token=<url-encoded-token>`.

The token travels in the URL **fragment**, which is never sent to any server, neither on the redirect itself nor on subsequent requests.
