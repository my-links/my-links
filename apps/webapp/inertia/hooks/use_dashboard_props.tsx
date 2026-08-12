import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { PageProps } from '@adonisjs/inertia/types';

import { DashboardProps } from '~/pages/dashboard';

// Stable references: default params re-evaluate on every call, so an inline
// `[]` here would change identity each render and break consumers (like
// useOptimisticOrder) that key an effect on these arrays.
const EMPTY_COLLECTIONS: Data.Collection[] = [];
const EMPTY_LINKS: Data.Link[] = [];

export const useDashboardProps = () => {
	const {
		followedCollections = EMPTY_COLLECTIONS,
		myPublicCollections = EMPTY_COLLECTIONS,
		myPrivateCollections = EMPTY_COLLECTIONS,
		inboxCollection,
		activeCollection = null,
		favoriteLinks = EMPTY_LINKS,
	} = usePage<PageProps & DashboardProps>().props;

	// The sidebar pins the Inbox on its own, but everything that reasons about
	// where a link lives still has to see it as one of the user's collections.
	const myCollections = useMemo(
		() => [
			...myPublicCollections,
			...myPrivateCollections,
			...(inboxCollection ? [inboxCollection] : []),
		],
		[myPublicCollections, myPrivateCollections, inboxCollection]
	);

	const allCollections = useMemo(
		() => [...followedCollections, ...myCollections],
		[followedCollections, myCollections]
	);

	return {
		followedCollections,
		myPublicCollections,
		myPrivateCollections,
		inboxCollection,
		myCollections,
		allCollections,
		activeCollection,
		favoriteLinks,
	};
};
