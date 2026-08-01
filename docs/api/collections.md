# Collections

## Get collections

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

The user's [default collection](/api/data-types#default-collection) is part of this list, flagged `isDefault: true`.

## Create collection

**Endpoint:** `POST /api/v1/collections`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body:**

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

## Update collection

**Endpoint:** `PUT /api/v1/collections/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL parameters:**

- `id` (required): Collection ID

**Request body:**

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

## Delete collection

**Endpoint:** `DELETE /api/v1/collections/:id`

**Headers:**

- `Authorization: Bearer <token>`

**URL parameters:**

- `id` (required): Collection ID

**Response:**

```json
{
	"message": "Collection deleted successfully"
}
```
