import { Link } from '@inertiajs/react';
import { Text } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import classes from './collection_item.module.css';

export function CollectionFavoriteItem() {
	const activeCollection = useActiveCollection();
	const tuyau = useTuyauRequired();
	const isActiveCollection = !activeCollection?.id;
	const starIconClass = isActiveCollection
		? 'i-tabler-star-filled'
		: 'i-tabler-star';

	return (
		<Link
			className={classes.link}
			data-active={isActiveCollection || undefined}
			href={tuyau.$route('dashboard').path}
			key="favorite"
			title="Favorite"
		>
			<div className={`${starIconClass} ${classes.linkIcon}`} />
			<Text maw={'200px'} style={{ wordBreak: 'break-all' }}>
				<Trans>Favorite</Trans>
			</Text>
		</Link>
	);
}
