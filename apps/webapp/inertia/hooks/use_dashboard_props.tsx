import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';

import { DashboardProps } from '~/pages/dashboard';

export const useDashboardProps = () => {
	const {
		followedCollections = [],
		myPublicCollections = [],
		myPrivateCollections = [],
		inboxCollection,
		activeCollection = null,
		favoriteLinks = [],
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
