import { DisplayPreferences } from '#shared/types/index';
import { SimpleGrid, Stack, StyleProp } from '@mantine/core';
import { LinkItem } from '~/components/dashboard/link/item/link_item';
import { NoLink } from '~/components/dashboard/link/no_link/no_link';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useFavoriteLinks } from '~/hooks/collections/use_favorite_links';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';

export interface LinkListProps {
	hideMenu?: boolean;
}

export function LinkList({ hideMenu = false }: LinkListProps) {
	const activeCollection = useActiveCollection();
	const favoriteLinks = useFavoriteLinks();
	const { displayPreferences } = useDisplayPreferences();

	const links = activeCollection?.links || favoriteLinks;

	if (links.length === 0) {
		return <NoLink hideMenu={hideMenu} />;
	}

	return (
		<Stack gap="xs">
			<SimpleGrid cols={getColsByView(displayPreferences)} spacing="xs">
				{links.map((link) => (
					<LinkItem link={link} key={link.id} hideMenu={hideMenu} />
				))}
			</SimpleGrid>
		</Stack>
	);
}

function getColsByView(
	displayPreferences: DisplayPreferences
): StyleProp<number> {
	const { linkListDisplay } = displayPreferences;

	if (linkListDisplay === 'grid') {
		return {
			sm: 1,
			md: 2,
			lg: 3,
		};
	}
	return 1;
}
