import { Stack } from '@mantine/core';
import { LinkItem } from '~/components/dashboard/link/item/link_item';
import { NoLink } from '~/components/dashboard/link/no_link/no_link';
import { useActiveCollection } from '~/stores/collection_store';

export interface LinkListProps {
	hideMenu?: boolean;
}

export function LinkList({ hideMenu = false }: LinkListProps) {
	const { activeCollection } = useActiveCollection();

	if (!activeCollection?.links || activeCollection.links.length === 0) {
		return <NoLink hideMenu={hideMenu} />;
	}

	return (
		<Stack gap="xs">
			{activeCollection?.links.map((link) => (
				<LinkItem link={link} key={link.id} hideMenu={hideMenu} />
			))}
		</Stack>
	);
}
