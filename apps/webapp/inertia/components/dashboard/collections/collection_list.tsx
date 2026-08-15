import type { ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { Button, IconButton } from '@minimalstuff/ui';

import { KEYS } from '~/consts/keys';
import { Kbd } from '~/components/common/kbd';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { useSidebarMode } from '~/hooks/use_sidebar_mode';
import { CollapsibleSection } from './collapsible_section';
import { CollectionInboxItem } from './collection_inbox_item';
import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { useSectionOrderStore } from '~/stores/section_order_store';
import { CollectionFavoriteItem } from './collection_favorite_item';
import { useDashboardLayoutStore } from '~/stores/dashboard_layout_store';
import {
	COLLECTION_SECTION,
	type CollectionSection,
} from '~/lib/dnd/dnd_types';
import { useDashboardDndCollections } from '~/components/dashboard/dnd/dashboard_dnd_provider';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

type SectionConfig = {
	title: ReactNode;
	collections: CollectionWithLinks[];
	alwaysShow?: boolean;
};

interface CollectionListProps {
	onCreateCollection: () => void;
}

export function CollectionList({
	onCreateCollection,
}: Readonly<CollectionListProps>) {
	const { followedCollections, myPublicCollections, myPrivateCollections } =
		useDashboardDndCollections();
	const { inboxCollection } = useDashboardProps();
	const { order, moveSectionUp, moveSectionDown } = useSectionOrderStore();
	const { toggleSidebar } = useDashboardLayoutStore();
	const isMobile = useIsMobile();
	const isRail = useSidebarMode() === 'rail';

	const handleCreateCollection = () => onCreateCollection();

	const sectionsByKey: Record<CollectionSection, SectionConfig> = {
		[COLLECTION_SECTION.FOLLOWED]: {
			title: <Trans>Followed Collections</Trans>,
			collections: followedCollections,
			alwaysShow: true,
		},
		[COLLECTION_SECTION.PUBLIC]: {
			title: <Trans>My Public Collections</Trans>,
			collections: myPublicCollections,
			alwaysShow: true,
		},
		[COLLECTION_SECTION.PRIVATE]: {
			title: <Trans>My Private Collections</Trans>,
			collections: myPrivateCollections,
			alwaysShow: true,
		},
	};

	const renderedSectionsCount = Object.values(sectionsByKey).filter(
		(section) => section.alwaysShow ?? section.collections.length > 0
	).length;
	const canCollapse = renderedSectionsCount > 1;

	return (
		<div className="flex flex-col flex-1 min-h-0" data-tour="collections-list">
			<div className="flex items-center justify-between gap-2 px-2 py-1">
				{!isMobile && isRail && (
					<IconButton
						icon="i-ant-design-plus-outlined"
						onClick={handleCreateCollection}
						data-tour="create-collection"
						aria-label={t`Create collection`}
						title={t`Create collection`}
						variant="subtle"
						size="sm"
						className="mx-auto"
					/>
				)}

				{!isMobile && !isRail && (
					<Button
						variant="subtle"
						size="sm"
						onClick={handleCreateCollection}
						data-tour="create-collection"
						fullWidth
					>
						<Trans>
							Create collection <Kbd>{KEYS.OPEN_CREATE_COLLECTION_KEY}</Kbd>
						</Trans>
					</Button>
				)}

				{isMobile && (
					<IconButton
						icon="i-ant-design-close-outlined"
						onClick={toggleSidebar}
						aria-label={t`Close sidebar`}
						variant="ghost"
						className="ml-auto"
					/>
				)}
			</div>

			<div className="px-2 pt-1 pb-2 space-y-1">
				{!isRail && (
					<p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
						<Trans>Views</Trans>
					</p>
				)}
				<CollectionFavoriteItem />
				<CollectionInboxItem collection={inboxCollection} />
			</div>

			<div className="flex-1 overflow-y-auto space-y-1 px-2" scroll-region="">
				{order.map((section, index) => (
					<CollapsibleSection
						key={section}
						title={sectionsByKey[section].title}
						collections={sectionsByKey[section].collections}
						section={section}
						canCollapse={canCollapse}
						alwaysShow={sectionsByKey[section].alwaysShow}
						canMoveUp={index > 0}
						canMoveDown={index < order.length - 1}
						onMoveUp={() => moveSectionUp(section)}
						onMoveDown={() => moveSectionDown(section)}
					/>
				))}
			</div>
		</div>
	);
}
