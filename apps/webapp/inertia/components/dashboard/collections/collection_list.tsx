import type { ReactNode } from 'react';
import { t } from '@lingui/core/macro';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { IconButton } from '@minimalstuff/ui';

import { CollapsibleSection } from './collapsible_section';
import { useSectionOrderStore } from '~/stores/section_order_store';
import { useSectionCollapseStore } from '~/stores/section_collapse_store';
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
	showFavoriteItem?: boolean;
};

export function CollectionList() {
	const { followedCollections, myPublicCollections, myPrivateCollections } =
		useDashboardDndCollections();
	const { order, moveSectionUp, moveSectionDown } = useSectionOrderStore();
	const { collapseAll, expandAll } = useSectionCollapseStore();

	const sectionsByKey: Record<CollectionSection, SectionConfig> = {
		[COLLECTION_SECTION.FOLLOWED]: {
			title: <Trans>Followed Collections</Trans>,
			collections: followedCollections,
			alwaysShow: true,
		},
		[COLLECTION_SECTION.PUBLIC]: {
			title: <Trans>My Public Collections</Trans>,
			collections: myPublicCollections,
		},
		[COLLECTION_SECTION.PRIVATE]: {
			title: <Trans>My Private Collections</Trans>,
			collections: myPrivateCollections,
			alwaysShow: true,
			showFavoriteItem: true,
		},
	};

	const renderedSectionsCount = Object.values(sectionsByKey).filter(
		(section) => section.alwaysShow ?? section.collections.length > 0
	).length;
	const canCollapse = renderedSectionsCount > 1;

	return (
		<div className="flex flex-col h-full">
			{canCollapse && (
				<div className="flex items-center justify-end gap-0.5 px-2 pt-1">
					<IconButton
						icon="i-mdi-unfold-less-horizontal"
						size="sm"
						variant="ghost"
						onClick={() => collapseAll()}
						aria-label={t`Collapse all`}
					/>
					<IconButton
						icon="i-mdi-unfold-more-horizontal"
						size="sm"
						variant="ghost"
						onClick={() => expandAll()}
						aria-label={t`Expand all`}
					/>
				</div>
			)}
			<div className="flex-1 overflow-y-auto space-y-1 px-2">
				{order.map((section, index) => (
					<CollapsibleSection
						key={section}
						title={sectionsByKey[section].title}
						collections={sectionsByKey[section].collections}
						section={section}
						canCollapse={canCollapse}
						alwaysShow={sectionsByKey[section].alwaysShow}
						showFavoriteItem={sectionsByKey[section].showFavoriteItem}
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
