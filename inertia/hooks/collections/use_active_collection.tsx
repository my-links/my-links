import { CollectionWithLinks } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';

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
