import { Card, Group, Text } from '@mantine/core'; // Import de Mantine
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import { LinkWithCollection } from '~/types/app';
import styles from './favorite_item.module.css';

export const FavoriteItem = ({
	link: { name, url, collection },
}: {
	link: LinkWithCollection;
}) => (
	<Card className={styles.linkWrapper} radius="sm" withBorder>
		<Group justify="center" gap="xs">
			<LinkFavicon size={32} url={url} />
			<ExternalLinkStyled href={url} style={{ flex: 1 }}>
				<div className={styles.linkName}>
					<Text lineClamp={1}>{name} </Text>
				</div>
				<Text c="gray" size="xs" lineClamp={1}>
					{collection.name}
				</Text>
			</ExternalLinkStyled>
		</Group>
	</Card>
);
