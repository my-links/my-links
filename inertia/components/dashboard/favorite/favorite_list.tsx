import { Flex, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { FavoriteItem } from '~/components/dashboard/favorite/item/favorite_item';
import { useFavoriteLinks } from '~/hooks/collections/use_favorite_links';

export function FavoriteList() {
	const { t } = useTranslation('common');
	const favoriteLinks = useFavoriteLinks();

	if (favoriteLinks.length === 0) {
		return (
			<Group justify="center">
				<Text c="dimmed" size="sm" mt="sm">
					{t('favorites-appears-here')}
				</Text>
			</Group>
		);
	}

	return (
		<Flex direction="column">
			<Text c="dimmed" mt="xs" ml="md" mb={4}>
				{t('favorite')} • {favoriteLinks.length}
			</Text>
			<Stack gap={4}>
				{favoriteLinks.map((link) => (
					<FavoriteItem link={link} key={link.id} />
				))}
			</Stack>
		</Flex>
	);
}
