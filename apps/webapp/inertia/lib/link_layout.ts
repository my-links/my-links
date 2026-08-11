import type { CSSProperties } from 'react';

import type { Layout } from '~/stores/layout_store';

const GRID_CARD_MIN_WIDTH_PX = 380;
const COMPACT_CARD_MIN_WIDTH_PX = 320;
const MASONRY_CARD_WIDTH_PX = 380;
const LIST_ITEM_GAP_PX = 12;

export function getLinkContainerClassName(layout: Layout): string {
	switch (layout) {
		case 'grid':
			return 'grid gap-4';
		case 'list':
			return 'flex flex-col';
		case 'compact':
			return 'grid gap-3';
		case 'masonry':
			return 'gap-4';
	}
}

export function getLinkContainerStyle(layout: Layout): CSSProperties {
	switch (layout) {
		case 'grid':
			return {
				gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_CARD_MIN_WIDTH_PX}px, 1fr))`,
			};
		case 'compact':
			return {
				gridTemplateColumns: `repeat(auto-fill, minmax(${COMPACT_CARD_MIN_WIDTH_PX}px, 1fr))`,
			};
		case 'masonry':
			return { columnWidth: `${MASONRY_CARD_WIDTH_PX}px` };
		case 'list':
			return { gap: `${LIST_ITEM_GAP_PX}px` };
	}
}

export function getLinkItemWrapperClassName(layout: Layout): string {
	return layout === 'masonry' ? 'mb-4' : '';
}

export function getLinkItemWrapperStyle(layout: Layout): CSSProperties {
	return layout === 'masonry' ? { breakInside: 'avoid' } : {};
}
