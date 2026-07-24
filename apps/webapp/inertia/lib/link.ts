import type { Data } from '@generated/data';

/**
 * The backend only nests `collectionIds` for the owner's own links (see
 * CollectionTransformer.withLinks) — non-owner/shared views get bare links.
 */
export function hasCollectionIds(
	link: Data.Link
): link is Data.Link.Variants['withCollections'] {
	return 'collectionIds' in link;
}
