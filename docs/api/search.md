# Search

## Search collections and links

Full-text search across the authenticated user's collections and links.

**Endpoint:** `GET /api/v1/search`

**Headers:**

- `Authorization: Bearer <token>`

**Query parameters:**

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
