# API Documentation

This document describes the REST API endpoints available in MyLinks. Every endpoint requires authentication using a Bearer token, except the health check.

An OpenAPI 3.1 document is generated from the source and is what the browser extension's typed client is built from. Regenerate it with `node ace openapi:generate` from `apps/webapp`; it is written to `apps/webapp/.adonisjs/openapi.json`.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [CORS](#cors)
- [Collections](#collections)
- [Links](#links)
- [Search](#search)
- [Sync](#sync)
- [Tokens](#tokens)
- [Health](#health)
- [Non-API Routes](#non-api-routes)
- [Error Responses](#error-responses)
- [Data Types](#data-types)

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

All API endpoints require authentication using a Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

To create an API token, use the web interface at `/user/settings`. The browser extension obtains its own token through the [authorization handoff](#extension-authorization-handoff) instead.

## Rate Limiting

Every `/api/v1/*` route is throttled to **300 requests per minute**, keyed by authenticated user (so all of a user's devices and tabs share one budget) and falling back to the client IP for the unauthenticated health route. The limit sits far above normal client usage — it protects small self-hosted instances from a runaway client.

Exceeding it returns `429 Too Many Requests` with a `Retry-After` header.

The store backing the counters is set with the `LIMITER_STORE` environment variable (`database` or `memory`).

## CORS

`/api/v1/*` is the only path reachable cross-origin, and only from browser extension origins (`chrome-extension://`, `moz-extension://`). Credentials are off: the browser never attaches the session cookie, so the API's own bearer token remains the only way in.

Everything outside `/api/v1` is the Inertia application, which is same-origin and session-authenticated.

## Collections

### Get Collections

Retrieve all collections for the authenticated user.

**Endpoint:** `GET /api/v1/collections`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
	"collections": [
		{
			"id": 1,
			"name": "My Collection",
			"description": "Collection description",
			"visibility": "PUBLIC",
			"authorId": 1,
			"author": {
				"id": 1,
				"name": "John Doe",
				"email": "john@example.com"
			},
			"links": [
				{
					"id": 1,
					"name": "Example Link",
					"description": "Link description",
					"url": "https://example.com",
					"favorite": false,
					"clicks": 12,
					"lastClickedAt": "2024-01-02T00:00:00.000Z",
					"collectionIds": [1],
					"authorId": 1,
					"createdAt": "2024-01-01T00:00:00.000Z",
					"updatedAt": "2024-01-01T00:00:00.000Z"
				}
			],
			"icon": "📚",
			"isDefault": false,
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z",
			"isOwner": true
		}
	]
}
```

The user's [default collection](#default-collection) is part of this list, flagged `isDefault: true`.

### Create Collection

Create a new collection.

**Endpoint:** `POST /api/v1/collections`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**

```json
{
	"name": "My Collection",
	"description": "Collection description (optional, max 254 characters)",
	"visibility": "PUBLIC",
	"icon": "📚"
}
```

**Fields:**

- `name` (required): Collection name (1-254 characters)
- `description` (optional): Collection description (max 254 characters, nullable)
- `visibility` (required): Collection visibility (`PUBLIC` or `PRIVATE`)
- `icon` (optional): Emoji icon (max 10 characters, must be a valid emoji)

**Response:**

```json
{
	"message": "Collection created successfully",
	"collection": {
		"id": 1,
		"name": "My Collection",
		"description": "Collection description",
		"visibility": "PUBLIC",
		"authorId": 1,
		"author": {
			"id": 1,
			"name": "John Doe",
			"email": "john@example.com"
		},
		"links": [],
		"icon": "📚",
		"isDefault": false,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z",
		"isOwner": true
	}
}
```

### Update Collection

Update an existing collection.

**Endpoint:** `PUT /api/v1/collections/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL Parameters:**

- `id` (required): Collection ID

**Request Body:**

```json
{
	"name": "Updated Collection Name",
	"description": "Updated description",
	"visibility": "PRIVATE",
	"icon": "🔖"
}
```

**Fields:**

- `name` (required): Collection name (1-254 characters)
- `description` (optional): Collection description (max 254 characters, nullable)
- `visibility` (required): Collection visibility (`PUBLIC` or `PRIVATE`)
- `icon` (optional): Emoji icon (max 10 characters, must be a valid emoji)

**Response:**

```json
{
	"message": "Collection updated successfully"
}
```

### Delete Collection

Delete a collection.

**Endpoint:** `DELETE /api/v1/collections/:id`

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `id` (required): Collection ID

**Response:**

```json
{
	"message": "Collection deleted successfully"
}
```

## Links

### Create Link

Create a new link in a collection.

**Endpoint:** `POST /api/v1/links`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**

```json
{
	"name": "Example Link",
	"description": "Link description (optional, max 300 characters)",
	"url": "https://example.com",
	"favorite": false,
	"collectionIds": [1]
}
```

**Fields:**

- `name` (required): Link name (1-254 characters)
- `description` (optional): Link description (max 300 characters)
- `url` (required): Link URL (valid URL format)
- `favorite` (required): Whether the link is marked as favorite (boolean)
- `collectionIds` (optional): IDs of the collections to add the link to (defaults to the Inbox collection when omitted or empty)

**Response:**

```json
{
	"message": "Link created successfully",
	"link": {
		"id": 1,
		"name": "Example Link",
		"description": "Link description",
		"url": "https://example.com",
		"favorite": false,
		"clicks": 0,
		"lastClickedAt": null,
		"collectionIds": [1],
		"authorId": 1,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
}
```

### Update Link

Update an existing link.

**Endpoint:** `PUT /api/v1/links/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL Parameters:**

- `id` (required): Link ID

**Request Body:**

```json
{
	"name": "Updated Link Name",
	"description": "Updated description",
	"url": "https://updated-example.com",
	"favorite": true,
	"collectionIds": [1]
}
```

**Fields:**

- `name` (required): Link name (1-254 characters)
- `description` (optional): Link description (max 300 characters)
- `url` (required): Link URL (valid URL format)
- `favorite` (required): Whether the link is marked as favorite (boolean)
- `collectionIds` (required): IDs of the collections this link belongs to (may be empty — falls back to the Inbox collection)

**Response:**

```json
{
	"message": "Link updated successfully"
}
```

### Delete Link

Delete a link.

**Endpoint:** `DELETE /api/v1/links/:id`

**Headers:**

- `Authorization: Bearer <token>`

**URL Parameters:**

- `id` (required): Link ID

**Response:**

```json
{
	"message": "Link deleted successfully"
}
```

### Get Favorite Links

Retrieve all favorite links for the authenticated user.

**Endpoint:** `GET /api/v1/links/favorites`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
[
	{
		"id": 1,
		"name": "Favorite Link",
		"description": "Link description",
		"url": "https://example.com",
		"favorite": true,
		"clicks": 12,
		"lastClickedAt": "2024-01-02T00:00:00.000Z",
		"collectionIds": [1],
		"authorId": 1,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
]
```

## Search

### Search Collections and Links

Full-text search across the authenticated user's collections and links.

**Endpoint:** `GET /api/v1/search`

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `term` (required): Search term (at least 1 character, trimmed)
- `type` (optional): Restrict results to `link`, `collection`, or `both` (default `both`)

**Response:**

```json
[
	{
		"id": 1,
		"type": "link",
		"name": "Example Link",
		"url": "https://example.com",
		"icon": null,
		"matchedPart": "Example",
		"rank": 0.6079
	},
	{
		"id": 2,
		"type": "collection",
		"name": "Examples",
		"url": null,
		"icon": "📚",
		"matchedPart": "Example",
		"rank": 0.3042
	}
]
```

**Fields:**

- `type`: `link` or `collection` — tells which entity the `id` refers to
- `url`: the link's URL; always `null` for collections
- `icon`: the collection's emoji; always `null` for links
- `matchedPart`: the fragment of the entity that matched, for highlighting
- `rank`: relevance score, higher is better

## Sync

### Get Delta

Returns everything that changed since a given cursor, including deletions. This is what the browser extension polls instead of refetching the whole tree.

**Endpoint:** `GET /api/v1/sync`

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `since` (optional): The `syncedAt` value from the previous delta response, as an ISO 8601 timestamp. Omit it to request a full snapshot.

**Response:**

```json
{
	"syncedAt": "2024-01-01T12:00:00.000Z",
	"isFullSync": false,
	"collections": [],
	"links": [],
	"deletedCollectionIds": [4],
	"deletedLinkIds": [17, 18]
}
```

**Fields:**

- `syncedAt`: cursor to send back as `since` on the next call
- `isFullSync`: `true` when the response is a complete snapshot rather than a delta — either because `since` was omitted, or because it predates the tombstone retention window (see below). A client receiving `true` must replace its local state instead of merging into it.
- `collections`: full [Collection objects](#collection-object) created or updated since the cursor
- `links`: full [Link objects](#link-object) created or updated since the cursor, each carrying `collectionIds`
- `deletedCollectionIds` / `deletedLinkIds`: ids removed since the cursor

**Notes:**

- Deletions are recorded as tombstones kept for **30 days**. A cursor older than that can no longer be brought up to date incrementally, so a full snapshot is served instead.
- The cursor is applied with a one-second overlap, so a client may receive rows it already has. Clients are expected to upsert by id.
- An unparseable `since` is rejected rather than silently treated as "the beginning of time".

## Tokens

### Check Token

Verify if an API token is valid.

**Endpoint:** `GET /api/v1/tokens/check`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
	"message": "Token is valid"
}
```

**Error Response (401 Unauthorized):**

```json
{
	"message": "Unauthorized"
}
```

## Health

### Health Check

Check the overall health status of the application.
This route is intended for infrastructure probes/checks and **does not require authentication**.

**Endpoint:** `GET /api/v1/health`

**Headers:**

- No headers required

**Response (200 OK):**

```json
{
	"isHealthy": true
}
```

**Response (503 Service Unavailable):**

```json
{
	"isHealthy": false
}
```

## Non-API Routes

These routes live outside `/api/v1` but are part of the contract clients rely on.

### Link Redirect

Redirects to a link's target URL and counts the click. Clicks feed the ranking the extension uses when it pins favourites to the bookmarks bar.

**Endpoint:** `GET /l/:id`

**Authentication:** none required — links in public collections are reachable by anonymous visitors, and their clicks count the same way. A session, when present, is still resolved.

**Response:** `302 Found` with the target URL in `Location`. The redirect is deliberately temporary so browsers keep asking the server and the counter keeps moving.

Rate-limited like the API, falling back to the client IP when there is no user.

### Favicon Proxy

**Endpoint:** `GET /favicon?url=<encoded-target-url>`

Returns the favicon for a target URL, so clients do not have to reach out to third-party origins themselves.

### Extension Authorization Handoff

Mints an API token for the browser extension and hands it back to the browser.

**Endpoint:** `GET /extension/authorize?redirect_uri=<extension-callback-url>`

**Authentication:** the user's session — this is a browser navigation, not an API call. An unauthenticated visitor goes through the normal login flow first.

**Behaviour:**

1. `redirect_uri` is validated against the browser-reserved callback shapes (`https://<id>.chromiumapp.org/*` for Chromium, `https://<sha1>.extensions.allizom.org/*` for Firefox). Anything else is refused — this is what stops the endpoint from minting a token for an arbitrary third-party origin.
2. A token named `Browser extension` is created for the signed-in user.
3. The response redirects to `redirect_uri` with `#token=<url-encoded-token>`.

The token travels in the URL **fragment**, which is never sent to any server — neither on the redirect itself nor on subsequent requests.

## Error Responses

Errors on `/api/v1/*` share one body shape, with the meaning carried by the HTTP status code:

```json
{
	"message": "Bad Request",
	"errors": [
		{
			"field": "name",
			"message": "The name field is required"
		}
	]
}
```

Clients should branch on the status, not on `message`:

| Status | Meaning                                                         |
| ------ | --------------------------------------------------------------- |
| `400`  | Malformed request that carries no more specific status          |
| `401`  | Token missing, expired or revoked — reconnect rather than retry |
| `403`  | Authenticated, but the resource belongs to someone else         |
| `404`  | No such collection or link                                      |
| `422`  | Validation failed; `errors` lists the offending fields          |
| `429`  | Rate limit exceeded — see [Rate Limiting](#rate-limiting)       |
| `500`  | Unexpected server error                                         |

## Data Types

### Visibility Enum

- `PUBLIC`: Collection is visible to all users
- `PRIVATE`: Collection is only visible to the owner

### Link Object

```typescript
{
	id: number;
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	clicks: number; // Visits counted through /l/:id
	lastClickedAt: string | null; // ISO 8601 date string
	collectionIds: number[];
	authorId: number;
	createdAt: string | null; // ISO 8601 date string
	updatedAt: string | null; // ISO 8601 date string
}
```

A link may belong to several collections at once. Creating one without any collection files it in the [default collection](#default-collection).

### Default Collection

Every user has one collection flagged `isDefault: true`, named **Inbox**, created on demand the first time a link needs it. It is where a link with no explicit collection lands, and where a link falls back when the last collection holding it is deleted.

It behaves like any other collection on read, with one restriction: it cannot be deleted (`DELETE` returns an error). Clients should treat it as read-only and never offer it as a rename or delete target.

### Collection Object

```typescript
{
  id: number;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  authorId: number;
  author?: User;
  links: Link[];
  icon: string | null;  // Emoji string
  isDefault: boolean;  // True for the user's Inbox collection
  createdAt: string | null;  // ISO 8601 date string
  updatedAt: string | null;  // ISO 8601 date string
  isOwner?: boolean;
}
```

### User Object

```typescript
{
	id: number;
	name: string;
	email: string;
}
```
