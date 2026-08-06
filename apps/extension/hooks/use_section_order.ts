import { useEffect, useState } from 'react';

import { sectionOrderStorage } from '@/lib/storage';
import type { CollectionSection } from '@/lib/dnd/dnd_types';
import {
	DEFAULT_SECTION_ORDER,
	moveSectionDown as moveDownInOrder,
	moveSectionUp as moveUpInOrder,
} from '@/lib/section_order';

interface UseSectionOrderReturn {
	order: CollectionSection[];
	moveSectionUp: (section: CollectionSection) => void;
	moveSectionDown: (section: CollectionSection) => void;
}

/**
 * Purely a local display preference, never synced to the server — the same
 * choice the webapp made for its own section order (zustand persisted to
 * `localStorage`). Mirrors `collectionsCacheStorage`'s
 * get-then-watch pattern (see `use_followed_collections.ts`) so every open
 * sidebar/newtab stays in sync when the order changes in another window.
 */
export function useSectionOrder(): UseSectionOrderReturn {
	const [order, setOrder] = useState<CollectionSection[]>(
		DEFAULT_SECTION_ORDER
	);

	useEffect(() => {
		void sectionOrderStorage.getValue().then(setOrder);
		return sectionOrderStorage.watch((nextOrder) => setOrder(nextOrder));
	}, []);

	return {
		order,
		moveSectionUp: (section) => {
			void sectionOrderStorage.setValue(moveUpInOrder(order, section));
		},
		moveSectionDown: (section) => {
			void sectionOrderStorage.setValue(moveDownInOrder(order, section));
		},
	};
}
