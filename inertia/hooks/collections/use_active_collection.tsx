import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { CollectionWithLinks } from '~/types/app';

interface UseActiveCollectionProps {
	activeCollection?: CollectionWithLinks;
}

export const useActiveCollection = () => {
	const { props } = usePage<PageProps & UseActiveCollectionProps>();
	return props.activeCollection;
};

export type WithActiveCollectionProps = {
	activeCollection?: CollectionWithLinks;
};

export const withActiveCollection = (
	Component: React.ComponentType<WithActiveCollectionProps>
) => {
	return (props: WithActiveCollectionProps) => {
		const activeCollection = useActiveCollection();
		return <Component {...props} activeCollection={activeCollection} />;
	};
};
