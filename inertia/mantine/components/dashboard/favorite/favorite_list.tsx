import { Box, Group, ScrollArea, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { FavoriteItem } from '~/mantine/components/dashboard/favorite/item/favorite_item';
import { useFavorites } from '~/store/collection_store';
import styles from './favorite_list.module.css';

export function FavoriteList() {
	const { t } = useTranslation('common');
	const { favorites } = useFavorites();

	if (favorites.length === 0) {
		return (
			<Group justify="center">
				<Text c="dimmed" size="sm" mt="sm">
					{t('favorites-appears-here')}
				</Text>
			</Group>
		);
	}

	return (
		<Box className={styles.sideMenu}>
			<Box className={styles.listContainer}>
				<div style={{ display: 'flex', flexDirection: 'column' }}>
					<Text c="dimmed" mt="xs" ml="md" mb={4}>
						{t('favorite')} • {favorites.length}
					</Text>
					<ScrollArea className={styles.collectionList}>
						<Stack gap={4}>
							{favorites.map((link) => (
								<FavoriteItem link={link} key={link.id} />
							))}
						</Stack>
					</ScrollArea>
				</div>
			</Box>
		</Box>
	);
}
