import { useEffect, useState } from 'react';

import { collectionCollapseStorage } from '@/lib/storage';
import type { CollectionSection } from '@/lib/dnd/dnd_types';
import {
	DEFAULT_COLLECTION_COLLAPSE_STATE,
	collapseAll as collapseAllInState,
	expandAll as expandAllInState,
	toggleCollection as toggleCollectionInState,
	toggleSection as toggleSectionInState,
	toggleSectionRecursive as toggleSectionRecursiveInState,
	type CollectionCollapseState,
} from '@/lib/collection_collapse';

interface UseCollectionCollapseReturn {
	state: CollectionCollapseState;
	isHydrated: boolean;
	toggleSection: (section: CollectionSection) => void;
	toggleSectionRecursive: (
		section: CollectionSection,
		collectionIds: number[]
	) => void;
	toggleCollection: (collectionId: number) => void;
	collapseAll: (sections: CollectionSection[], collectionIds: number[]) => void;
	expandAll: (sections: CollectionSection[], collectionIds: number[]) => void;
}

/**
 * Purely a local display preference, never synced to the server — same
 * get-then-watch pattern as `useSectionOrder` so every open sidebar/newtab
 * stays in sync when collapse state changes in another window.
 */
export function useCollectionCollapse(): UseCollectionCollapseReturn {
	const [state, setState] = useState<CollectionCollapseState>(
		DEFAULT_COLLECTION_COLLAPSE_STATE
	);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		void collectionCollapseStorage.getValue().then((initialState) => {
			setState(initialState);
			setIsHydrated(true);
		});
		return collectionCollapseStorage.watch((nextState) => setState(nextState));
	}, []);

	return {
		state,
		isHydrated,
		toggleSection: (section) => {
			void collectionCollapseStorage.setValue(
				toggleSectionInState(state, section)
			);
		},
		toggleSectionRecursive: (section, collectionIds) => {
			void collectionCollapseStorage.setValue(
				toggleSectionRecursiveInState(state, section, collectionIds)
			);
		},
		toggleCollection: (collectionId) => {
			void collectionCollapseStorage.setValue(
				toggleCollectionInState(state, collectionId)
			);
		},
		collapseAll: (sections, collectionIds) => {
			void collectionCollapseStorage.setValue(
				collapseAllInState(state, sections, collectionIds)
			);
		},
		expandAll: (sections, collectionIds) => {
			void collectionCollapseStorage.setValue(
				expandAllInState(state, sections, collectionIds)
			);
		},
	};
}
