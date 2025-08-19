import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { LinkWithCollection } from '~/types/app';

interface UseFavoriteLinksProps {
	favoriteLinks: LinkWithCollection[];
}

export const useFavoriteLinks = () => {
	const { props } = usePage<PageProps & UseFavoriteLinksProps>();
	return props.favoriteLinks;
};
