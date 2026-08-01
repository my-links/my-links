# Links

## Create link

Create a new link in a collection.

**Endpoint:** `POST /api/v1/links`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body:**

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

## Update link

**Endpoint:** `PUT /api/v1/links/:id`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL parameters:**

- `id` (required): Link ID

**Request body:**

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

## Delete link

**Endpoint:** `DELETE /api/v1/links/:id`

**Headers:**

- `Authorization: Bearer <token>`

**URL parameters:**

- `id` (required): Link ID

**Response:**

```json
{
	"message": "Link deleted successfully"
}
```

## Get favorite links

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
