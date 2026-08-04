import { Trans } from '@lingui/react/macro';

import { COLLECTION_SECTION } from '~/lib/dnd/dnd_types';
import { CollapsibleSection } from './collapsible_section';
import { useDashboardDndCollections } from '~/components/dashboard/dnd/dashboard_dnd_provider';

export function CollectionList() {
	const { followedCollections, myPublicCollections, myPrivateCollections } =
		useDashboardDndCollections();

	const sectionsCount = [
		followedCollections.length > 0,
		myPublicCollections.length > 0,
		myPrivateCollections.length > 0,
	].filter(Boolean).length;
	const canCollapse = sectionsCount > 1;

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto space-y-1 px-2">
				<CollapsibleSection
					title={<Trans>Followed Collections</Trans>}
					collections={followedCollections}
					section={COLLECTION_SECTION.FOLLOWED}
					canCollapse={canCollapse}
				/>
				<CollapsibleSection
					title={<Trans>My Public Collections</Trans>}
					collections={myPublicCollections}
					section={COLLECTION_SECTION.PUBLIC}
					canCollapse={canCollapse}
				/>
				<CollapsibleSection
					title={<Trans>My Private Collections</Trans>}
					collections={myPrivateCollections}
					section={COLLECTION_SECTION.PRIVATE}
					canCollapse={canCollapse}
					alwaysShow
				/>
			</div>
		</div>
	);
}
