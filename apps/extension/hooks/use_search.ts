import { useMemo } from 'react';

import type { LinkResource } from '@/lib/api/types';
import { useCollections } from '@/hooks/use_collections';
import { matchLinks, type FuzzyMatch } from '@/lib/search/fuzzy_links';

interface UseSearchReturn {
	results: FuzzyMatch<LinkResource>[];
	isLoading: boolean;
}

/**
 * A link can belong to several collections, so the cache is deduped by id
 * before matching — otherwise the same link could show up more than once.
 */
function collectUniqueLinks(
	collections: readonly { links?: LinkResource[] }[]
): LinkResource[] {
	const linksById = new Map<number, LinkResource>();

	for (const collection of collections) {
		for (const link of collection.links ?? []) {
			linksById.set(link.id, link);
		}
	}

	return [...linksById.values()];
}

export function useSearch(term: string): UseSearchReturn {
	const { collections, isLoading } = useCollections();

	const links = useMemo(() => collectUniqueLinks(collections), [collections]);
	const results = useMemo(() => matchLinks(links, term), [links, term]);

	return { results, isLoading };
}
