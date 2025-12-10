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

export type WithCollectionsProps = {
	collections: CollectionWithLinks[];
};

export const withCollections = <T extends object>(
	Component: React.ComponentType<T & WithCollectionsProps>
): React.ComponentType<Omit<T, 'collections'>> => {
	return (props: Omit<T, 'collections'>) => {
		const collections = useCollections();
		return <Component {...(props as T)} collections={collections} />;
	};
};
