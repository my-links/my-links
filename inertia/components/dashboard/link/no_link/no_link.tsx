import { Link } from '@inertiajs/react';
import { Anchor, Box, Text } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';
import type { LinkListProps } from '~/components/dashboard/link/list/link_list';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';
import styles from './no_link.module.css';

interface NoLinkProps extends LinkListProps {}

export function NoLink({ hideMenu }: NoLinkProps) {
	const activeCollection = useActiveCollection();
	const tuyau = useTuyauRequired();
	const isFavorite = !activeCollection?.id;

	return (
		<Box className={styles.noCollection} p="xl">
			{isFavorite ? (
				<Text className={styles.text}>
					<Trans>No favorite links yet</Trans>
				</Text>
			) : (
				<Text className={styles.text}>
					<TransComponent
						id="home:no-link"
						message="No links in collection {name}"
						values={{ name: activeCollection?.name ?? '' }}
					/>
				</Text>
			)}
			{!hideMenu && !isFavorite && (
				<Anchor
					component={Link}
					href={appendCollectionId(
						tuyau.$route('link.create-form').path,
						activeCollection?.id
					)}
				>
					<Trans>Create a link</Trans>
				</Anchor>
			)}
		</Box>
	);
}
