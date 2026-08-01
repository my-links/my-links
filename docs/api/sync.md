# Sync

## Get delta

Returns everything that changed since a given cursor, including deletions. This is what the browser extension polls instead of refetching the whole tree.

**Endpoint:** `GET /api/v1/sync`

**Headers:**

- `Authorization: Bearer <token>`

**Query parameters:**

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
- `collections`: full [Collection objects](/api/data-types#collection-object) created or updated since the cursor
- `links`: full [Link objects](/api/data-types#link-object) created or updated since the cursor, each carrying `collectionIds`
- `deletedCollectionIds` / `deletedLinkIds`: ids removed since the cursor

**Notes:**

- Deletions are recorded as tombstones kept for **30 days**. A cursor older than that can no longer be brought up to date incrementally, so a full snapshot is served instead.
- The cursor is applied with a one-second overlap, so a client may receive rows it already has. Clients are expected to upsert by id.
- An unparseable `since` is rejected rather than silently treated as "the beginning of time".
