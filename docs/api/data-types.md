# Data types

## Visibility enum

- `PUBLIC`: Collection is visible to all users
- `PRIVATE`: Collection is only visible to the owner

## Link object

```typescript
{
	id: number;
	name: string;
	description: string | null;
	url: string;
	favorite: boolean;
	clicks: number; // Owner visits recorded through POST /l/:id or POST /api/v1/links/:id/visits
	lastClickedAt: string | null; // ISO 8601 date string
	collectionIds?: number[]; // Left out of the links inside a followed collection
	authorId: number;
	author?: User; // Only when the endpoint loads it
	createdAt: string | null; // ISO 8601 date string
	updatedAt: string | null; // ISO 8601 date string
}
```

A link may belong to several collections at once. Creating one without any collection files it in the [default collection](#default-collection).

## Default collection

Every user has one collection flagged `isDefault: true`, named **Inbox**, created on demand the first time a link needs it. It is where a link with no explicit collection lands, and where a link falls back when the last collection holding it is deleted.

It behaves like any other collection on read, with one restriction: it cannot be deleted (`DELETE` returns an error). Clients should treat it as read-only and never offer it as a rename or delete target.

## Collection object

```typescript
{
  id: number;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  authorId: number;
  author?: User;  // Only when the endpoint loads it, e.g. on followed collections
  links?: Link[];  // Left out by endpoints that do not carry links, e.g. sync
  position?: number;  // Own collections only: rank within the visibility section
  linksCount?: number;  // Only when the server computed it, not part of the REST endpoints
  followersCount?: number;  // Only when the server computed it, not part of the REST endpoints
  icon: string | null;  // Emoji string
  isDefault: boolean;  // True for the user's Inbox collection
  createdAt: string | null;  // ISO 8601 date string
  updatedAt: string | null;  // ISO 8601 date string
  isOwner: boolean;  // True when the authenticated user is the author
}
```

Which optional keys are present depends on the endpoint. `GET /api/v1/collections` returns `links` and `position` for the user's own collections, and `links` and `author` for followed ones. [Sync](/api/sync) returns collections without `links`.

## User object

```typescript
{
	id: number;
	fullname: string;
	isAdmin: boolean;
	createdAt: string | null; // ISO 8601 date string
	updatedAt: string | null; // ISO 8601 date string
}
```

The REST API never returns an email address.
