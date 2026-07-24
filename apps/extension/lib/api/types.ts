import type { components } from '@/lib/api/schema';

export type CollectionWithLinks =
	components['schemas']['GetCollectionsRenderResponse']['data'][number];

export type LinkResource = NonNullable<CollectionWithLinks['links']>[number];
