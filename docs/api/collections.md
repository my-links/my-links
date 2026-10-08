# Collections

## Get collections

Retrieve the authenticated user's own collections, and the public collections they follow.

**Endpoint:** `GET /api/v1/collections`

**Headers:**

- `Authorization: Bearer <token>`

**Response:**

```json
{
	"data": [
		{
			"id": 1,
			"name": "My Collection",
			"description": "Collection description",
			"visibility": "PUBLIC",
			"authorId": 1,
			"icon": "📚",
			"isDefault": false,
			"isOwner": true,
			"position": 0,
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
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	],
	"followedCollections": [
		{
			"id": 9,
			"name": "A shared collection",
			"description": null,
			"visibility": "PUBLIC",
			"authorId": 2,
			"author": {
				"id": 2,
				"fullname": "Ada Lovelace",
				"isAdmin": false,
				"createdAt": "2024-01-01T00:00:00.000Z",
				"updatedAt": "2024-01-01T00:00:00.000Z"
			},
			"icon": null,
			"isDefault": false,
			"isOwner": false,
			"links": [],
			"createdAt": "2024-01-01T00:00:00.000Z",
			"updatedAt": "2024-01-01T00:00:00.000Z"
		}
	]
}
```

- `data`: the user's own [Collection objects](/api/data-types#collection-object), each with its `links` and its `position`. They are ordered by `position` within each visibility, then by name, and the links of each collection follow the order set in the app. The user's [default collection](/api/data-types#default-collection) is part of this list, flagged `isDefault: true`.
- `followedCollections`: the public collections of other users that this user follows, with their `links` and their `author`, in the order the follower chose. They are never owned (`isOwner: false`), and their links carry no `collectionIds`: only an owner may see which of their other collections a link belongs to.

## Create collection

**Endpoint:** `POST /api/v1/collections`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body:**

```json
{
	"name": "My Collection",
	"description": "Collection description (max 254 characters, or null)",
	"visibility": "PUBLIC",
	"icon": "📚"
}
```

**Fields:**

- `name` (required): Collection name (1-254 characters)
- `description` (required): Collection description (max 254 characters). The key must be present, but its value may be `null`
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
		"icon": "📚",
		"isDefault": false,
		"isOwner": true,
		"position": 0,
		"createdAt": "2024-01-01T00:00:00.000Z",
		"updatedAt": "2024-01-01T00:00:00.000Z"
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
- `description` (required): Collection description (max 254 characters). The key must be present, but its value may be `null`
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

## Reorder own collections

Sets the order of the user's own collections in one section.

**Endpoint:** `PUT /api/v1/collections/owned/reorder`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body:**

```json
{
	"visibility": "PUBLIC",
	"collectionIds": [3, 1, 2]
}
```

**Fields:**

- `visibility` (required): The section being reordered (`PUBLIC` or `PRIVATE`)
- `collectionIds` (required): Every collection of that section, in the new order (positive integers, no duplicates, at least one). The [default collection](/api/data-types#default-collection) is pinned outside the sortable sections, so it is never part of the list.

**Response:**

```json
{
	"message": "Collections reordered successfully"
}
```

A collection that is not the user's returns `422`. A list that does not match the section's current collections exactly (a stale client, a missing id) returns `409`: reload and retry.

## Reorder followed collections

**Endpoint:** `PUT /api/v1/collections/followed/reorder`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request body:**

```json
{
	"collectionIds": [9, 4]
}
```

**Fields:**

- `collectionIds` (required): Every collection the user follows, in the new order (positive integers, no duplicates, at least one)

**Response:**

```json
{
	"message": "Collections reordered successfully"
}
```

A list that is not exactly the set of followed collections returns `422`. The order is personal to the follower and does not affect the author's.

## Reorder links in a collection

**Endpoint:** `PUT /api/v1/collections/:id/links/reorder`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL parameters:**

- `id` (required): Collection ID, which must belong to the user (`404` otherwise)

**Request body:**

```json
{
	"linkIds": [12, 7, 9]
}
```

**Fields:**

- `linkIds` (required): Every link of the collection, in the new order (positive integers, no duplicates, at least one)

**Response:**

```json
{
	"message": "Links reordered successfully"
}
```

A list that does not match the collection's current links exactly returns `409`: reload and retry.
