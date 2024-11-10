import { Link as InertiaLink } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ActionIcon, Menu } from '@mantine/core';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaRegEye } from 'react-icons/fa';
import { GoPencil } from 'react-icons/go';
import { IoTrashOutline } from 'react-icons/io5';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { onFavorite } from '~/lib/favorite';
import { appendCollectionId, appendLinkId } from '~/lib/navigation';
import { useFavorites } from '~/stores/collection_store';
import { Link, PublicLink } from '~/types/app';

interface LinksControlsProps {
	link: Link | PublicLink;
	showGoToCollection?: boolean;
}
export default function LinkControls({
	link,
	showGoToCollection = false,
}: LinksControlsProps) {
	const { toggleFavorite } = useFavorites();
	const { t } = useTranslation('common');

	const onFavoriteCallback = () => toggleFavorite(link.id);
	const handleStopPropagation = (event: MouseEvent<HTMLButtonElement>) =>
		event.preventDefault();

	return (
		<Menu withinPortal shadow="md" width={200}>
			<Menu.Target>
				<ActionIcon
					variant="subtle"
					color="var(--mantine-color-text)"
					onClick={handleStopPropagation}
				>
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
				{'favorite' in link && (
					<Menu.Item
						onClick={() =>
							onFavorite(link.id, !link.favorite, onFavoriteCallback)
						}
						leftSection={link.favorite ? <MdFavorite /> : <MdFavoriteBorder />}
						color="var(--mantine-color-yellow-7)"
					>
						{link.favorite ? t('remove-favorite') : t('add-favorite')}
					</Menu.Item>
				)}
				<Menu.Item
					component={InertiaLink}
					href={appendLinkId(route('link.edit-form').path, link.id)}
					leftSection={<GoPencil />}
					color="blue"
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
