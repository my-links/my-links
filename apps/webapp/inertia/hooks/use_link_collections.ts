import type { Data } from '@generated/data';
import { useMemo } from 'react';

import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { hasCollectionIds, type DisplayLink } from '~/lib/link';

type UseLinkCollectionsReturn = {
	linkCollections: Data.Collection[];
};

export function useLinkCollections(
	link: DisplayLink
): UseLinkCollectionsReturn {
	const { activeCollection, myCollections } = useDashboardProps();

	// Excludes the collection already being viewed, but a link can belong to others (e.g. from search).
	const linkCollections = useMemo(() => {
		if (!hasCollectionIds(link)) return [];
		return myCollections.filter(
			(collection) =>
				link.collectionIds.includes(collection.id) &&
				collection.id !== activeCollection?.id
		);
	}, [link, myCollections, activeCollection]);

	return { linkCollections };
}
