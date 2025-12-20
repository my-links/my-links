import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';
import { Collection } from '#shared/types/dto';
import { CollectionItem } from './collection_item';
import { CollectionFavoriteItem } from './collection_favorite_item';
import { Trans } from '@lingui/react/macro';

interface PagePropsWithCollections extends PageProps {
	collections: Collection[];
}

export function CollectionList() {
	const { props } = usePage<PagePropsWithCollections>();
	const collections = props.collections || [];

	return (
		<div className="flex flex-col h-full">
			<div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
				<Trans>Collections</Trans> • {collections.length}
			</div>
			<div className="flex-1 overflow-y-auto space-y-1 px-2">
				<CollectionFavoriteItem />
				{collections.map((collection) => (
					<CollectionItem key={collection.id} collection={collection} />
				))}
			</div>
		</div>
	);
}

