import { CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

interface UseCollectionsProps {
	collections: CollectionWithLinks[];
}

export const useCollections = () => {
	const { props } = usePage<PageProps & UseCollectionsProps>();
	return props.collections;
};
