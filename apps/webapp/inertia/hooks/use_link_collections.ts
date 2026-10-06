import { useMemo } from 'react';
import type { Data } from '@generated/data';

import { hasCollectionIds } from '~/lib/link';
import { useDashboardProps } from '~/hooks/use_dashboard_props';

type UseLinkCollectionsReturn = {
	linkCollections: Data.Collection[];
};

export function useLinkCollections(link: Data.Link): UseLinkCollectionsReturn {
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
