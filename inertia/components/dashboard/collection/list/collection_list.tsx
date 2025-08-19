import { Box, ScrollArea, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import CollectionItem from '~/components/dashboard/collection/item/collection_item';
import { useCollections } from '~/hooks/collections/use_collections';
import styles from './collection_list.module.css';

export default function CollectionList() {
	const { t } = useTranslation('common');
	const collections = useCollections();
	return (
		<Box className={styles.sideMenu}>
			<Box className={styles.listContainer}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Text c="dimmed" ml="md" mb="sm">
						{t('collection.collections', { count: collections.length })} •{' '}
						{collections.length}
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
