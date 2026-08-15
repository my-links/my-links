import type { ReactNode } from 'react';
import { IconButton, Tooltip } from '@minimalstuff/ui';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useCollections } from '@/hooks/use_collections';
import { CollectionSection } from './collection_section';
import type { CollectionWithLinks } from '@/lib/api/types';
import { CollapsibleSection } from './collapsible_section';
import { PinnedInboxSection } from './pinned_inbox_section';
import { useSectionOrder } from '@/hooks/use_section_order';
import { CollectionsDndProvider } from './collections_dnd_provider';
import { useCollectionCollapse } from '@/hooks/use_collection_collapse';
import { useFollowedCollections } from '@/hooks/use_followed_collections';
import { FollowedCollectionSection } from './followed_collection_section';
import {
	isSectionExpanded,
	isCollectionExpanded,
} from '@/lib/collection_collapse';
import {
	COLLECTION_SECTION,
	collectionSortableId,
	type CollectionSection as CollectionDndSection,
} from '@/lib/dnd/dnd_types';

const SECTION_TITLE: Record<CollectionDndSection, string> = {
	[COLLECTION_SECTION.FOLLOWED]: 'Followed',
	[COLLECTION_SECTION.PUBLIC]: 'Public',
	[COLLECTION_SECTION.PRIVATE]: 'Private',
};

const SECTION_ICON: Record<CollectionDndSection, string> = {
	[COLLECTION_SECTION.FOLLOWED]: 'i-ant-design-team-outlined',
	[COLLECTION_SECTION.PUBLIC]: 'i-ant-design-global-outlined',
	[COLLECTION_SECTION.PRIVATE]: 'i-ant-design-lock-outlined',
};

function byPosition(a: CollectionWithLinks, b: CollectionWithLinks) {
	return a.position - b.position;
}

export function CollectionTree() {
	const { collections, isLoading, error } = useCollections();
	const {
		followedCollections,
		isLoading: isFollowedLoading,
		error: followedError,
	} = useFollowedCollections();
	const { order, moveSectionUp, moveSectionDown } = useSectionOrder();
	const {
		state: collapseState,
		isHydrated: isCollapseStateHydrated,
		toggleSection,
		toggleSectionRecursive,
		toggleCollection,
		collapseAll,
		expandAll,
	} = useCollectionCollapse();

	if (isLoading || isFollowedLoading || !isCollapseStateHydrated) {
		return <p className="p-4 text-sm text-gray-500">Loading collections…</p>;
	}

	if (error || followedError) {
		return (
			<p className="p-4 text-sm text-red-500">
				Couldn't load collections. Check your connection.
			</p>
		);
	}

	const inboxCollection = collections.find(
		(collection) => collection.isDefault
	);
	const privateCollections = collections
		.filter(
			(collection) =>
				collection.visibility === 'PRIVATE' && !collection.isDefault
		)
		.sort(byPosition);
	const publicCollections = collections
		.filter((collection) => collection.visibility === 'PUBLIC')
		.sort(byPosition);

	const renderSection = (
		section: CollectionDndSection,
		index: number
	): ReactNode => {
		const sectionCollections =
			section === COLLECTION_SECTION.FOLLOWED
				? followedCollections
				: section === COLLECTION_SECTION.PUBLIC
					? publicCollections
					: privateCollections;

		if (sectionCollections.length === 0) {
			return null;
		}

		const sectionCollectionIds = sectionCollections.map(
			(collection) => collection.id
		);

		return (
			<CollapsibleSection
				key={section}
				title={SECTION_TITLE[section]}
				icon={SECTION_ICON[section]}
				count={sectionCollections.length}
				isExpanded={isSectionExpanded(collapseState, section)}
				onToggle={(isRecursive) =>
					isRecursive
						? toggleSectionRecursive(section, sectionCollectionIds)
						: toggleSection(section)
				}
				canMoveUp={index > 0}
				canMoveDown={index < order.length - 1}
				onMoveUp={() => moveSectionUp(section)}
				onMoveDown={() => moveSectionDown(section)}
			>
				<SortableContext
					items={sectionCollections.map((collection) =>
						collectionSortableId(collection.id)
					)}
					strategy={verticalListSortingStrategy}
				>
					{section === COLLECTION_SECTION.FOLLOWED
						? followedCollections.map((collection) => (
								<FollowedCollectionSection
									key={collection.id}
									collection={collection}
									isExpanded={isCollectionExpanded(
										collapseState,
										collection.id
									)}
									onToggle={() => toggleCollection(collection.id)}
								/>
							))
						: (sectionCollections as CollectionWithLinks[]).map(
								(collection) => (
									<CollectionSection
										key={collection.id}
										collection={collection}
										section={section}
										isExpanded={isCollectionExpanded(
											collapseState,
											collection.id
										)}
										onToggle={() => toggleCollection(collection.id)}
									/>
								)
							)}
				</SortableContext>
			</CollapsibleSection>
		);
	};

	const isEmpty =
		!inboxCollection &&
		collections.length === 0 &&
		followedCollections.length === 0;
	const allCollectionIds = [
		...collections.map((collection) => collection.id),
		...followedCollections.map((collection) => collection.id),
	];

	return (
		<div className="flex-1 overflow-y-auto px-2 py-1">
			{isEmpty ? (
				<p className="p-4 text-sm text-gray-500">No collections yet.</p>
			) : (
				<>
					<div className="flex items-center justify-end gap-0.5 pb-1">
						<Tooltip content="Collapse all" position="bottom">
							<IconButton
								icon="i-mdi-unfold-less-horizontal"
								size="sm"
								variant="ghost"
								onClick={() => collapseAll(order, allCollectionIds)}
								aria-label="Collapse all"
							/>
						</Tooltip>
						<Tooltip content="Expand all" position="bottom">
							<IconButton
								icon="i-mdi-unfold-more-horizontal"
								size="sm"
								variant="ghost"
								onClick={() => expandAll(order, allCollectionIds)}
								aria-label="Expand all"
							/>
						</Tooltip>
					</div>
					<CollectionsDndProvider>
						{/* Scoped off DndContext's own DOM parent — it injects hidden a11y sibling divs that would otherwise pick up a stray divide-y border too. */}
						<div className="divide-y divide-gray-200 space-y-1 dark:divide-gray-700">
							{inboxCollection && (
								<PinnedInboxSection
									collection={inboxCollection}
									isExpanded={isCollectionExpanded(
										collapseState,
										inboxCollection.id
									)}
									onToggle={() => toggleCollection(inboxCollection.id)}
								/>
							)}
							{order.map((section, index) => renderSection(section, index))}
						</div>
					</CollectionsDndProvider>
				</>
			)}
		</div>
	);
}
