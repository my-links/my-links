import type { Layout } from '~/stores/layout_store';

export function getLinkContainerClassName(layout: Layout): string {
	switch (layout) {
		case 'grid':
			return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
		case 'list':
			return 'space-y-3';
		case 'compact':
			return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3';
		case 'masonry':
			return 'columns-1 md:columns-2 lg:columns-3 gap-4';
	}
}

export function getLinkItemWrapperClassName(layout: Layout): string {
	return layout === 'masonry' ? 'break-inside-avoid mb-4' : '';
}
