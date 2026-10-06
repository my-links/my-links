import { createContext } from 'react';
import type { Data } from '@generated/data';

type CollectionWithLinks = Data.Collection.Variants['withLinks'];

export type DashboardDndContextValue = {
	followedCollections: CollectionWithLinks[];
	myPublicCollections: CollectionWithLinks[];
	myPrivateCollections: CollectionWithLinks[];
	activeCollectionLinks: Data.Link[];
};

export const DashboardDndContext =
	createContext<DashboardDndContextValue | null>(null);
