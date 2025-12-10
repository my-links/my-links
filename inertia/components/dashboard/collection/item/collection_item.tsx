import { CollectionWithLinks } from '#shared/types/dto';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { appendCollectionId } from '~/lib/navigation';
import classes from './collection_item.module.css';

interface CollectionItemProps {
	collection: CollectionWithLinks;
}

export function CollectionItem({ collection }: CollectionItemProps) {
	const itemRef = useRef<HTMLAnchorElement>(null);
	const activeCollection = useActiveCollection();
	const isActiveCollection = collection.id === activeCollection?.id;
	const FolderIcon = isActiveCollection ? AiFillFolderOpen : AiOutlineFolder;

	useEffect(() => {
		if (collection.id === activeCollection?.id) {
			itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [collection.id, activeCollection?.id]);

	return (
		<Link
			className={classes.link}
			data-active={isActiveCollection || undefined}
			href={appendCollectionId(route('dashboard').path, collection.id)}
			key={collection.id}
			ref={itemRef}
			title={collection.name}
		>
			<FolderIcon className={classes.linkIcon} />
			<Text
				lineClamp={1}
				style={{ wordBreak: 'break-all', whiteSpace: 'pre-line' }}
			>
				{collection.name}
			</Text>
		</Link>
	);
}
