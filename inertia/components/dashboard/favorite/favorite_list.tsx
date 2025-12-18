import { Trans } from '@lingui/react/macro';
import { Flex, Group, Stack, Text } from '@mantine/core';
import { FavoriteItem } from '~/components/dashboard/favorite/item/favorite_item';
import { useFavoriteLinks } from '~/hooks/collections/use_favorite_links';

export function FavoriteList() {
	const favoriteLinks = useFavoriteLinks();

	if (favoriteLinks.length === 0) {
		return (
			<Group justify="center">
				<Text c="dimmed" size="sm" mt="sm">
					<Trans>Your favorites will appear here</Trans>
				</Text>
			</Group>
		);
	}

	return (
		<Flex direction="column">
			<Text c="dimmed" mt="xs" ml="md" mb={4}>
				<Trans>Favorite</Trans> • {favoriteLinks.length}
			</Text>
			<Stack gap={4}>
				{favoriteLinks.map((link) => (
					<FavoriteItem link={link} key={link.id} />
				))}
			</Stack>
		</Flex>
	);
}
