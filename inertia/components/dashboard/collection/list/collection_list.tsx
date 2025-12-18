import { Box, ScrollArea, Text } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import CollectionItem from '~/components/dashboard/collection/item/collection_item';
import { useCollections } from '~/hooks/collections/use_collections';
import styles from './collection_list.module.css';

export default function CollectionList() {
	const collections = useCollections();
	return (
		<Box className={styles.sideMenu}>
			<Box className={styles.listContainer}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Text c="dimmed" ml="md" mb="sm">
						<Trans>Collections</Trans> • {collections.length}
					</Text>
					<ScrollArea className={styles.collectionList}>
						{collections.map((collection) => (
							<CollectionItem collection={collection} key={collection.id} />
						))}
					</ScrollArea>
				</div>
			</Box>
		</Box>
	);
}
