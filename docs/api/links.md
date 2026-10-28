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
- `collectionIds` (required): IDs of the collections this link belongs to (may be empty, falls back to the Inbox collection)

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
{
	"data": [
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
}
```

Each entry is a [Link object](/api/data-types#link-object).

## Move link to another collection

Removes the link from one of its collections and files it in another. Both collections must belong to the user.

**Endpoint:** `PUT /api/v1/links/:id/collection`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL parameters:**

- `id` (required): Link ID

**Request body:**

```json
{
	"fromCollectionId": 1,
	"toCollectionId": 2
}
```

**Fields:**

- `fromCollectionId` (required): A collection currently holding the link
- `toCollectionId` (required): The collection to move it to. If the link is already there, it is only removed from the source. Equal ids do nothing.

**Response:**

```json
{
	"message": "Link moved successfully"
}
```

A link or collection that is not the user's returns `422`. A link that is not in `fromCollectionId` returns `409`.

## Add link to a collection

Files the link in one more collection, keeping the ones it already belongs to. The link is appended at the end of the collection.

**Endpoint:** `POST /api/v1/links/:id/collections`

**Headers:**

- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**URL parameters:**

- `id` (required): Link ID

**Request body:**

```json
{
	"collectionId": 2
}
```

**Fields:**

- `collectionId` (required): The collection to add the link to. Nothing happens if the link is already in it.

**Response:**

```json
{
	"message": "Link added to collection successfully"
}
```

A link or collection that is not the user's returns `422`.

## Record a visit

Counts one click on a link. Clients call it when the user opens a saved link, so the ranking that pins favorites stays consistent across the webapp and the extension. Only a visit by the link's author is counted (`clicks` and `lastClickedAt` change, `updatedAt` does not, so a click never shows up in [sync](/api/sync)). A link in a public collection answers `204` to anyone, but only the owner's clicks are recorded.

**Endpoint:** `POST /api/v1/links/:id/visits`

**Headers:**

- `Authorization: Bearer <token>`

**URL parameters:**

- `id` (required): Link ID

**Response:** `204 No Content`. A link that is neither the user's nor in a public collection answers `404`, so the route never confirms that a private link exists.
