import { Link } from '@inertiajs/react';
import { Anchor, Box, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LinkListProps } from '~/components/dashboard/link/list/link_list';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';
import styles from './no_link.module.css';

interface NoLinkProps extends LinkListProps {}

export function NoLink({ hideMenu }: NoLinkProps) {
	const { t } = useTranslation('common');
	const activeCollection = useActiveCollection();
	const tuyau = useTuyauRequired();
	const isFavorite = !activeCollection?.id;

	const noLinkForCollection = t(
		'home:no-link',
		{ name: activeCollection?.name ?? '' } as any,
		{
			interpolation: { escapeValue: false },
		}
	);

	const noLinkForFavorite = t('home:no-link-favorite');

	return (
		<Box className={styles.noCollection} p="xl">
			<Text
				className={styles.text}
				dangerouslySetInnerHTML={{
					__html: isFavorite ? noLinkForFavorite : noLinkForCollection,
				}}
			/>
			{!hideMenu && !isFavorite && (
				<Anchor
					component={Link}
					href={appendCollectionId(
						tuyau.$route('link.create-form').path,
						activeCollection?.id
					)}
				>
					{t('link.create')}
				</Anchor>
			)}
		</Box>
	);
}
