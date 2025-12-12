import { Link } from '#shared/types/dto';
import { Link as InertiaLink, router } from '@inertiajs/react';
import { ActionIcon, Menu } from '@mantine/core';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { onFavorite } from '~/lib/favorite';
import { appendCollectionId, appendLinkId } from '~/lib/navigation';

interface LinksControlsProps {
	link: Link;
	showGoToCollection?: boolean;
}
export default function LinkControls({
	link,
	showGoToCollection = false,
}: LinksControlsProps) {
	const { t } = useTranslation('common');
	const tuyau = useTuyauRequired();

	const onFavoriteCallback = () => {
		const routeInfo = tuyau.$route('link.toggle-favorite', {
			id: link.id.toString(),
		});
		if (!routeInfo) {
			throw new Error('Route link.toggle-favorite not found');
		}
		router.put(routeInfo.path);
	};
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
					<div className="i-bootstrap-three-dots-vertical" />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				{showGoToCollection && (
					<Menu.Item
						component={InertiaLink}
						href={appendCollectionId(
							tuyau.$route('dashboard').path,
							link.collectionId
						)}
						leftSection={<div className="i-fa6-regular-eye" />}
						color="blue"
					>
						{t('go-to-collection')}
					</Menu.Item>
				)}
				{'favorite' in link && (
					<Menu.Item
						onClick={() =>
							onFavorite(tuyau, link.id, !link.favorite, onFavoriteCallback)
						}
						leftSection={
							<div
								className={
									link.favorite ? 'i-mdi-favorite' : 'i-mdi-favorite-border'
								}
							/>
						}
						color="var(--mantine-color-yellow-7)"
					>
						{link.favorite ? t('remove-favorite') : t('add-favorite')}
					</Menu.Item>
				)}
				<Menu.Item
					component={InertiaLink}
					href={appendLinkId(tuyau.$route('link.edit-form').path, link.id)}
					leftSection={<div className="i-octicon-pencil" />}
					color="blue"
				>
					{t('link.edit')}
				</Menu.Item>
				<Menu.Item
					component={InertiaLink}
					href={appendLinkId(tuyau.$route('link.delete-form').path, link.id)}
					leftSection={<div className="i-ion-trash-outline" />}
					color="red"
				>
					{t('link.delete')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
