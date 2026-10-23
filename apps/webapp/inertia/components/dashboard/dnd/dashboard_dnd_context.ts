import type { Data } from '@generated/data';
import { createContext } from 'react';

import type { DisplayLink } from '~/lib/link';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export type DashboardDndContextValue = {
	followedCollections: CollectionWithLinks[];
	myPublicCollections: CollectionWithLinks[];
	myPrivateCollections: CollectionWithLinks[];
	activeCollectionLinks: DisplayLink[];
};

export const DashboardDndContext =
	createContext<DashboardDndContextValue | null>(null);
