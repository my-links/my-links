import { LinkWithCollection } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

interface UseFavoriteLinksProps {
	favoriteLinks: LinkWithCollection[];
}

export const useFavoriteLinks = () => {
	const { props } = usePage<PageProps & UseFavoriteLinksProps>();
	return props.favoriteLinks;
};
