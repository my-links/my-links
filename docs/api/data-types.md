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
	clicks: number; // Visits counted through /l/:id
	lastClickedAt: string | null; // ISO 8601 date string
	collectionIds: number[];
	authorId: number;
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
  author?: User;
  links: Link[];
  icon: string | null;  // Emoji string
  isDefault: boolean;  // True for the user's Inbox collection
  createdAt: string | null;  // ISO 8601 date string
  updatedAt: string | null;  // ISO 8601 date string
  isOwner?: boolean;
}
```

## User object

```typescript
{
	id: number;
	name: string;
	email: string;
}
```
