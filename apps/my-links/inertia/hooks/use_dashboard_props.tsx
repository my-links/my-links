import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { DashboardProps } from '~/pages/dashboard';

export const useDashboardProps = () => {
	const {
		followedCollections = [],
		myPublicCollections = [],
		myPrivateCollections = [],
		activeCollection = null,
		favoriteLinks = [],
	} = usePage<PageProps & DashboardProps>().props;

	const allCollections = useMemo(
		() => [
			...followedCollections,
			...myPublicCollections,
			...myPrivateCollections,
		],
		[followedCollections, myPublicCollections, myPrivateCollections]
	);

	const myCollections = useMemo(
		() => [...myPublicCollections, ...myPrivateCollections],
		[myPublicCollections, myPrivateCollections]
	);

	return {
		followedCollections,
		myPublicCollections,
		myPrivateCollections,
		myCollections,
		allCollections,
		activeCollection,
		favoriteLinks,
	};
};
