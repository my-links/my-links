import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import useActiveCollection from '~/hooks/use_active_collection';
import { appendCollectionId } from '~/lib/navigation';
import { CollectionWithLinks } from '~/types/app';
import classes from './collection_item.module.css';

export default function CollectionItem({
	collection,
}: {
	collection: CollectionWithLinks;
}) {
	const itemRef = useRef<HTMLAnchorElement>(null);
	const { activeCollection } = useActiveCollection();
	const isActiveCollection = collection.id === activeCollection?.id;
	const FolderIcon = isActiveCollection ? AiFillFolderOpen : AiOutlineFolder;

	useEffect(() => {
		if (collection.id === activeCollection?.id) {
			itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, [collection.id, activeCollection?.id]);

	const linksCount = activeCollection?.links.length ?? 0;
	return (
		<Link
			className={classes.link}
			data-active={isActiveCollection || undefined}
			href={appendCollectionId(route('dashboard').path, collection.id)}
			key={collection.id}
			ref={itemRef}
		>
			<FolderIcon className={classes.linkIcon} />
			<Text lineClamp={1} maw="160px">
				{collection.name}
			</Text>
			{linksCount > 0 && (
				<Text c="var(--mantine-color-gray-5)" ml="xs">
					— {linksCount}
				</Text>
			)}
		</Link>
	);
}
