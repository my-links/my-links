import type { Data } from '@generated/data';

/**
 * The backend only nests `collectionIds` for the owner's own links (see
 * CollectionTransformer.withLinks): non-owner/shared views get bare links.
 */
export function hasCollectionIds(
	link: DisplayLink
): link is Data.Link.Variants['withCollections'] {
	return 'collectionIds' in link;
}

/** A link as the list components receive it: the owner's full shape, or the visitor's without usage stats. */
export type DisplayLink = Data.Link | Data.Link.Variants['forVisitor'];
