import { Collection } from '#shared/types/dto';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@adonisjs/inertia/types';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';
import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { CollectionControls } from './collection_controls';

interface CollectionItemProps {
	collection: Collection;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Collection | null;
}

export function CollectionItem({ collection }: CollectionItemProps) {
	const itemRef = useRef<HTMLAnchorElement>(null);
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const tuyau = useTuyauRequired();
	const isActive = collection.id === activeCollection?.id;

	useEffect(() => {
		if (isActive) {
			itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [isActive]);

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
		<div
			className={clsx(
				'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group',
				'hover:bg-white/50 dark:hover:bg-gray-800/50',
				'text-gray-700 dark:text-gray-300',
				isActive &&
					'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
			)}
			onContextMenu={handleContextMenu}
		>
			<Link
				ref={itemRef}
				href={appendCollectionId(tuyau.$route('dashboard').path, collection.id)}
				className="flex items-center gap-3 flex-1 min-w-0"
				title={collection.name}
			>
				<div
					className={clsx(
						'w-5 h-5 flex-shrink-0',
						isActive
							? 'i-ant-design-folder-open-filled'
							: 'i-ant-design-folder-outlined'
					)}
				/>
				<span className="truncate flex-1">{collection.name}</span>
			</Link>
			<div
				data-collection-controls
				className="opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<CollectionControls collection={collection} />
			</div>
		</div>
	);
}
