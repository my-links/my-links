import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { DashboardProps } from '~/pages/dashboard';

export const useDashboardProps = () => {
	const {
		followedCollections,
		myPublicCollections,
		myPrivateCollections,
		activeCollection,
		favoriteLinks,
	} = usePage<PageProps & DashboardProps>().props;

	const allCollections = useMemo(
		() => [
			...followedCollections,
			...myPublicCollections,
			...myPrivateCollections,
		],
		[followedCollections, myPublicCollections, myPrivateCollections]
	);

	return {
		followedCollections,
		myPublicCollections,
		myPrivateCollections,
		allCollections,
		activeCollection,
		favoriteLinks,
	};
};
