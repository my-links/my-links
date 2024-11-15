import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Text } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { appendCollectionId } from '~/lib/navigation';
import { useActiveCollection } from '~/stores/collection_store';
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

	const linksCount = collection?.links.length ?? 0;
	const showLinks = linksCount > 0;
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
				maw={'200px'}
				w="100%"
				style={{ wordBreak: 'break-all' }}
			>
				{collection.name}
			</Text>
			{showLinks && (
				<Text
					style={{ whiteSpace: 'nowrap' }}
					c="var(--mantine-color-gray-5)"
					ml={4}
				>
					— {linksCount}
				</Text>
			)}
		</Link>
	);
}
