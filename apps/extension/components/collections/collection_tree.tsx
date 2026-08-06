import type { ReactNode } from 'react';
import {
	SortableContext,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useCollections } from '@/hooks/use_collections';
import { CollectionSection } from './collection_section';
import type { CollectionWithLinks } from '@/lib/api/types';
import { CollapsibleSection } from './collapsible_section';
import { useSectionOrder } from '@/hooks/use_section_order';
import { CollectionsDndProvider } from './collections_dnd_provider';
import { useFollowedCollections } from '@/hooks/use_followed_collections';
import { FollowedCollectionSection } from './followed_collection_section';
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

/**
 * Followed defaults collapsed — a follower opens the extension for their own
 * links far more often than someone else's, and a large followed collection
 * shouldn't push those below the fold on every open.
 */
const SECTION_DEFAULT_EXPANDED: Record<CollectionDndSection, boolean> = {
	[COLLECTION_SECTION.FOLLOWED]: false,
	[COLLECTION_SECTION.PUBLIC]: true,
	[COLLECTION_SECTION.PRIVATE]: true,
};

function byPosition(a: CollectionWithLinks, b: CollectionWithLinks) {
	return a.position - b.position;
}

export function CollectionTree() {
	const { collections, isLoading, error } = useCollections();
	const { followedCollections } = useFollowedCollections();
	const { order, moveSectionUp, moveSectionDown } = useSectionOrder();

	if (isLoading) {
		return <p className="p-4 text-sm text-gray-500">Loading collections…</p>;
	}

	if (error) {
		return (
			<p className="p-4 text-sm text-red-500">
				Couldn't load collections. Check your connection.
			</p>
		);
	}

	const privateCollections = collections
		.filter((collection) => collection.visibility === 'PRIVATE')
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

		return (
			<CollapsibleSection
				key={section}
				title={SECTION_TITLE[section]}
				icon={SECTION_ICON[section]}
				count={sectionCollections.length}
				defaultExpanded={SECTION_DEFAULT_EXPANDED[section]}
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
								/>
							))
						: (sectionCollections as CollectionWithLinks[]).map(
								(collection) => (
									<CollectionSection
										key={collection.id}
										collection={collection}
										section={section}
									/>
								)
							)}
				</SortableContext>
			</CollapsibleSection>
		);
	};

	const isEmpty = collections.length === 0 && followedCollections.length === 0;

	return (
		<div className="flex-1 overflow-y-auto px-2 py-1">
			{isEmpty ? (
				<p className="p-4 text-sm text-gray-500">No collections yet.</p>
			) : (
				<CollectionsDndProvider>
					{/* Scoped off DndContext's own DOM parent — it injects hidden a11y sibling divs that would otherwise pick up a stray divide-y border too. */}
					<div className="divide-y divide-gray-200 space-y-1 dark:divide-gray-700">
						{order.map((section, index) => renderSection(section, index))}
					</div>
				</CollectionsDndProvider>
			)}
		</div>
	);
}
