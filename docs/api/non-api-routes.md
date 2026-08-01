# Non-API routes

These routes live outside `/api/v1` but are part of the contract clients rely on.

## Link redirect

Redirects to a link's target URL and counts the click. Clicks feed the ranking the extension uses when it pins favorites to the bookmarks bar.

**Endpoint:** `GET /l/:id`

**Authentication:** none required — links in public collections are reachable by anonymous visitors, and their clicks count the same way. A session, when present, is still resolved.

**Response:** `302 Found` with the target URL in `Location`. The redirect is deliberately temporary so browsers keep asking the server and the counter keeps moving.

Rate-limited like the API (see [Rate limiting](/api/#rate-limiting)), falling back to the client IP when there is no user.

## Favicon proxy

**Endpoint:** `GET /favicon?url=<encoded-target-url>`

Returns the favicon for a target URL, so clients do not have to reach out to third-party origins themselves.

## Extension authorization handoff

Mints an API token for the browser extension and hands it back to the browser.

**Endpoint:** `GET /extension/authorize?redirect_uri=<extension-callback-url>`

**Authentication:** the user's session — this is a browser navigation, not an API call. An unauthenticated visitor goes through the normal login flow first.

**Behavior:**

1. `redirect_uri` is validated against the browser-reserved callback shapes (`https://<id>.chromiumapp.org/*` for Chromium, `https://<sha1>.extensions.allizom.org/*` for Firefox). Anything else is refused — this is what stops the endpoint from minting a token for an arbitrary third-party origin.
2. A token named `Browser extension` is created for the signed-in user.
3. The response redirects to `redirect_uri` with `#token=<url-encoded-token>`.

The token travels in the URL **fragment**, which is never sent to any server — neither on the redirect itself nor on subsequent requests.
