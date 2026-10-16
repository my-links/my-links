import type { Data } from '@generated/data';

import { useDashboardProps } from '~/hooks/use_dashboard_props';

type UseTargetCollectionReturn = {
	targetCollection: Data.Collection | null;
	linksCount: number | undefined;
};

export function useTargetCollection(
	collection?: Data.Collection
): UseTargetCollectionReturn {
	const { activeCollection } = useDashboardProps();
	const targetCollection = collection ?? activeCollection;
	const linksCount = collection
		? collection.linksCount
		: activeCollection?.links?.length;

	return { targetCollection, linksCount };
}
