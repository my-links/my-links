import { Box, ScrollArea, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import CollectionItem from '~/components/dashboard/collection/item/collection_item';
import useShortcut from '~/hooks/use_shortcut';
import { useActiveCollection, useCollections } from '~/store/collection_store';
import styles from './collection_list.module.css';

export default function CollectionList() {
	const { t } = useTranslation('common');
	const { collections } = useCollections();
	const { activeCollection, setActiveCollection } = useActiveCollection();

	const goToPreviousCollection = () => {
		const currentCategoryIndex = collections.findIndex(
			({ id }) => id === activeCollection?.id
		);
		if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

		setActiveCollection(collections[currentCategoryIndex - 1]);
	};

	const goToNextCollection = () => {
		const currentCategoryIndex = collections.findIndex(
			({ id }) => id === activeCollection?.id
		);
		if (
			currentCategoryIndex === -1 ||
			currentCategoryIndex === collections.length - 1
		)
			return;

		setActiveCollection(collections[currentCategoryIndex + 1]);
	};

	useShortcut('ARROW_UP', goToPreviousCollection);
	useShortcut('ARROW_DOWN', goToNextCollection);

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
