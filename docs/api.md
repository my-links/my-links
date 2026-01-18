# API Documentation

This document describes the REST API endpoints available in MyLinks. All API endpoints require authentication using a Bearer token.

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

All API endpoints require authentication using a Bearer token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

To create an API token, use the web interface at `/user/settings`.

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
					"collectionId": 1,
					"authorId": 1,
					"createdAt": "2024-01-01T00:00:00.000Z",
					"updatedAt": "2024-01-01T00:00:00.000Z"
				}
			],
			"icon": "📚",
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z",
			"isOwner": true
		}
	]
}
```

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
	"collectionId": 1
}
```

**Fields:**

- `name` (required): Link name (1-254 characters)
- `description` (optional): Link description (max 300 characters)
- `url` (required): Link URL (valid URL format)
- `favorite` (required): Whether the link is marked as favorite (boolean)
- `collectionId` (required): ID of the collection to add the link to

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
		"collectionId": 1,
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
	"collectionId": 1
}
```

**Fields:**

- `name` (required): Link name (1-254 characters)
- `description` (optional): Link description (max 300 characters)
- `url` (required): Link URL (valid URL format)
- `favorite` (required): Whether the link is marked as favorite (boolean)
- `collectionId` (required): ID of the collection

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
		"collectionId": 1,
		"authorId": 1,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
	}
]
```

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

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

Returned when the authentication token is missing or invalid.

```json
{
	"message": "Unauthorized"
}
```

### 422 Unprocessable Entity

Returned when the request validation fails.

```json
{
	"errors": [
		{
			"field": "name",
			"message": "The name field is required"
		}
	]
}
```

### 500 Internal Server Error

Returned when an unexpected server error occurs.

```json
{
	"message": "An unexpected error occurred"
}
```

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
	collectionId: number;
	authorId: number;
	createdAt: string | null; // ISO 8601 date string
	updatedAt: string | null; // ISO 8601 date string
}
```

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
