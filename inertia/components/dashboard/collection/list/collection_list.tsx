import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { Box, ScrollArea, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import CollectionItem from '~/components/dashboard/collection/item/collection_item';
import useShortcut from '~/hooks/use_shortcut';
import { appendCollectionId } from '~/lib/navigation';
import { useActiveCollection, useCollections } from '~/stores/collection_store';
import styles from './collection_list.module.css';

export default function CollectionList() {
	const { t } = useTranslation('common');
	const { collections } = useCollections();
	const { activeCollection, setActiveCollection } = useActiveCollection();

	const replaceUrl = (collectionId: number) =>
		router.get(appendCollectionId(route('dashboard').path, collectionId));

	const goToPreviousCollection = () => {
		const currentCategoryIndex = collections.findIndex(
			({ id }) => id === activeCollection?.id
		);
		if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

		const collection = collections[currentCategoryIndex - 1];
		replaceUrl(collection.id);
		setActiveCollection(collection);
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

		const collection = collections[currentCategoryIndex + 1];
		replaceUrl(collection.id);
		setActiveCollection(collection);
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
