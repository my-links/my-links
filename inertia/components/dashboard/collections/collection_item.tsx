import { Collection } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { usePage } from '@inertiajs/react';
import { Link } from '@tuyau/inertia/react';
import clsx from 'clsx';
import { CollectionControls } from './collection_controls';

interface CollectionItemProps {
	collection: Collection;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Collection | null;
}

export function CollectionItem({ collection }: CollectionItemProps) {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isActive = collection.id === activeCollection?.id;

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		const container = e.currentTarget as HTMLElement;
		const controlsElement = container.querySelector(
			'[data-collection-controls]'
		);
		if (controlsElement) {
			const button = controlsElement.querySelector('button');
			button?.click();
		}
	};

	return (
		<Link
			route="collection.show"
			params={{ id: collection.id }}
			className={clsx(
				'flex items-center gap-3 px-4 py-2 rounded-md transition-colors group',
				'hover:bg-white/50 dark:hover:bg-gray-800/50',
				'text-gray-700 dark:text-gray-300',
				isActive &&
					'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
			)}
			onContextMenu={handleContextMenu}
			title={collection.name}
		>
			{collection.icon ? (
				<span className="text-lg flex-shrink-0 w-5 h-5 flex items-center justify-center">
					{collection.icon}
				</span>
			) : (
				<div
					className={clsx(
						'w-5 h-5 flex-shrink-0',
						isActive
							? 'i-ant-design-folder-open-filled'
							: 'i-ant-design-folder-outlined'
					)}
				/>
			)}
			<span className="truncate flex-1">{collection.name}</span>
			<CollectionControls collection={collection} />
		</Link>
	);
}
