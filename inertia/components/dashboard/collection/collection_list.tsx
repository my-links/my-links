import { ScrollArea, Stack, Text } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import { CollectionFavoriteItem } from '~/components/dashboard/collection/item/collection_favorite_item';
import { CollectionItem } from '~/components/dashboard/collection/item/collection_item';
import { useCollections } from '~/hooks/collections/use_collections';
import { useIsMobile } from '~/hooks/use_is_mobile';
import styles from './list/collection_list.module.css';

export function CollectionList() {
	const collections = useCollections();
	const isMobile = useIsMobile();

	return (
		<Stack gap="xs" h="100%" w={isMobile ? '100%' : '350px'}>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<Text c="dimmed" ml="md" mb="sm">
					<Trans>Collections</Trans> • {collections.length}
				</Text>
				<ScrollArea className={styles.collectionList}>
					<CollectionFavoriteItem />
					{collections.map((collection) => (
						<CollectionItem collection={collection} />
					))}
				</ScrollArea>
			</div>
		</Stack>
	);
}
