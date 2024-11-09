import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Anchor, Box, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LinkListProps } from '~/components/dashboard/link/list/link_list';
import { appendCollectionId } from '~/lib/navigation';
import { useActiveCollection } from '~/stores/collection_store';
import styles from './no_link.module.css';

interface NoLinkProps extends LinkListProps {}

export function NoLink({ hideMenu }: NoLinkProps) {
	const { t } = useTranslation('common');
	const { activeCollection } = useActiveCollection();
	return (
		<Box className={styles.noCollection} p="xl">
			<Text
				className={styles.text}
				dangerouslySetInnerHTML={{
					__html: t(
						'home:no-link',
						{ name: activeCollection?.name ?? '' } as any,
						{
							interpolation: { escapeValue: false },
						}
					),
				}}
			/>
			{!hideMenu && (
				<Anchor
					component={Link}
					href={appendCollectionId(
						route('link.create-form').path,
						activeCollection?.id
					)}
				>
					{t('link.create')}
				</Anchor>
			)}
		</Box>
	);
}
