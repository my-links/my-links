import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Link } from '@adonisjs/inertia/react';
import { useRef, type MouseEvent } from 'react';
import { PageProps } from '@adonisjs/inertia/types';
import type {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core';

import { shouldSuppressClick } from '~/lib/dnd/drag_click_guard';
import {
	CollectionControls,
	CollectionControlsRef,
} from './collection_controls';

interface CollectionItemProps {
	collection: Data.Collection;
	dragAttributes?: DraggableAttributes;
	dragListeners?: DraggableSyntheticListeners;
	setActivatorNodeRef?: (element: HTMLElement | null) => void;
}

interface PagePropsWithActiveCollection extends PageProps {
	activeCollection?: Data.Collection | null;
}

export function CollectionItem({
	collection,
	dragAttributes,
	dragListeners,
	setActivatorNodeRef,
}: Readonly<CollectionItemProps>) {
	const { props } = usePage<PagePropsWithActiveCollection>();
	const activeCollection = props.activeCollection;
	const isActive = collection.id === activeCollection?.id;
	const collectionControlsRef = useRef<CollectionControlsRef>(null);

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		collectionControlsRef.current?.openContextMenu(e.clientX, e.clientY);
	};

	const handleClick = (e: MouseEvent) => {
		if (shouldSuppressClick()) {
			e.preventDefault();
		}
	};

	return (
		<Link
			ref={setActivatorNodeRef}
			route="collection.show"
			routeParams={{ id: collection.id }}
			preserveScroll
			className={clsx(
				'relative flex items-center gap-3 px-4 py-2 rounded-md transition-colors group',
				'hover:bg-white/50 dark:hover:bg-gray-800/50',
				'text-gray-700 dark:text-gray-300',
				isActive &&
					'bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
			)}
			onContextMenu={handleContextMenu}
			onClick={handleClick}
			title={collection.name}
			{...dragAttributes}
			{...dragListeners}
		>
			{collection.icon ? (
				<span className="text-lg flex-shrink-0 w-5 h-5 flex items-center justify-center">
					{collection.icon}
				</span>
			) : collection.isDefault ? (
				<div className="w-5 h-5 flex-shrink-0 i-ant-design-inbox-outlined" />
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
			<CollectionControls ref={collectionControlsRef} collection={collection} />
		</Link>
	);
}
