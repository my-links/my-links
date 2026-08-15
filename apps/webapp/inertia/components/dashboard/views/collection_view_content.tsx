import { Trans } from '@lingui/react/macro';

import { useIsMobile } from '~/hooks/use_is_mobile';
import { useLayoutStore } from '~/stores/layout_store';
import { LinkList } from '~/components/common/link_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { SortableLinkList } from '~/components/dashboard/links/sortable_link_list';
import { useDashboardDndCollections } from '~/components/dashboard/dnd/dashboard_dnd_provider';

export function CollectionViewContent() {
	const isMobile = useIsMobile();
	const { layout } = useLayoutStore('dashboard');
	const { activeCollection } = useDashboardProps();
	const { activeCollectionLinks } = useDashboardDndCollections();
	const links = activeCollection?.links ?? [];
	const isOwner = activeCollection?.isOwner !== false;
	const effectiveLayout = isMobile ? 'list' : layout;
	const canReorderLinks =
		!!activeCollection &&
		isOwner &&
		effectiveLayout !== 'masonry' &&
		!isMobile &&
		links.length > 0;

	return canReorderLinks && activeCollection ? (
		<SortableLinkList
			links={activeCollectionLinks}
			collectionId={activeCollection.id}
			layout={effectiveLayout}
		/>
	) : (
		<LinkList
			links={links}
			layoutStoreKey="dashboard"
			emptyStateHint={<Trans>Create your first link to get started</Trans>}
		/>
	);
}
