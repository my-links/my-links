import { Link as InertiaLink } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ActionIcon, Menu } from '@mantine/core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaRegEye } from 'react-icons/fa';
import { GoPencil } from 'react-icons/go';
import { IoTrashOutline } from 'react-icons/io5';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import { onFavorite } from '~/lib/favorite';
import { appendCollectionId, appendLinkId } from '~/lib/navigation';
import { Link } from '~/types/app';

interface LinksControlsProps {
	link: Link;
	showGoToCollection?: boolean;
}
export default function LinkControls({
	link,
	showGoToCollection = false,
}: LinksControlsProps) {
	const { collections, setCollections } = useCollections();
	const { setActiveCollection } = useActiveCollection();
	const { t } = useTranslation('common');

	const toggleFavorite = useCallback(
		(linkId: Link['id']) => {
			let linkIndex = 0;
			const collectionIndex = collections.findIndex(({ links }) => {
				const lIndex = links.findIndex((l) => l.id === linkId);
				if (lIndex !== -1) {
					linkIndex = lIndex;
				}
				return lIndex !== -1;
			});

			const collectionLink = collections[collectionIndex].links[linkIndex];
			const collectionsCopy = [...collections];
			collectionsCopy[collectionIndex].links[linkIndex] = {
				...collectionLink,
				favorite: !collectionLink.favorite,
			};

			setCollections(collectionsCopy);
			setActiveCollection(collectionsCopy[collectionIndex]);
		},
		[collections, setCollections]
	);

	const onFavoriteCallback = () => toggleFavorite(link.id);
	return (
		<Menu withinPortal shadow="md" width={200}>
			<Menu.Target>
				<ActionIcon variant="subtle" color="var(--mantine-color-text)">
					<BsThreeDotsVertical />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{showGoToCollection && (
					<Menu.Item
						component={InertiaLink}
						href={appendCollectionId(route('dashboard').url, link.collectionId)}
						leftSection={<FaRegEye />}
						color="blue"
					>
						{t('go-to-collection')}
					</Menu.Item>
				)}
				<Menu.Item
					onClick={() =>
						onFavorite(link.id, !link.favorite, onFavoriteCallback)
					}
					leftSection={link.favorite ? <MdFavorite /> : <MdFavoriteBorder />}
					color="yellow"
				>
					{link.favorite ? t('remove-favorite') : t('add-favorite')}
				</Menu.Item>
				<Menu.Item
					component={InertiaLink}
					href={appendLinkId(route('link.edit-form').path, link.id)}
					leftSection={<GoPencil />}
					color="var(--mantine-color-blue-4)"
				>
					{t('link.edit')}
				</Menu.Item>
				<Menu.Item
					component={InertiaLink}
					href={appendLinkId(route('link.delete-form').path, link.id)}
					leftSection={<IoTrashOutline />}
					color="red"
				>
					{t('link.delete')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
