import type { components } from '@/lib/api/schema';

export type CollectionWithLinks =
	components['schemas']['GetCollectionsRenderResponse']['data'][number];

export type LinkResource = NonNullable<CollectionWithLinks['links']>[number];

export type CollectionVisibility = components['schemas']['Visibility'];

/**
 * A collection the user follows rather than owns. Read-only from the
 * extension's point of view — no `position` (the follower doesn't manage the
 * author's ordering) and its links carry no `collectionIds` (a follower
 * never sees which other collections a link belongs to).
 */
export type FollowedCollectionWithLinks =
	components['schemas']['GetCollectionsRenderResponse']['followedCollections'][number];

export type FollowedLinkResource = NonNullable<
	FollowedCollectionWithLinks['links']
>[number];
