import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbStar, TbStarFilled } from 'react-icons/tb';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import classes from './collection_item.module.css';

export function CollectionFavoriteItem() {
	const { t } = useTranslation();
	const activeCollection = useActiveCollection();
	const isActiveCollection = !activeCollection?.id;
	const FolderIcon = isActiveCollection ? TbStarFilled : TbStar;

	return (
		<Link
			className={classes.link}
			data-active={isActiveCollection || undefined}
			href={route('dashboard').path}
			key="favorite"
			title="Favorite"
		>
			<FolderIcon className={classes.linkIcon} />
			<Text maw={'200px'} style={{ wordBreak: 'break-all' }}>
				{t('favorite')}
			</Text>
		</Link>
	);
}
