import { Card, Group, Text } from '@mantine/core';
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkControls from '~/components/dashboard/link/link_controls';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import { LinkWithCollection } from '~/types/app';
import styles from './favorite_item.module.css';

export const FavoriteItem = ({ link }: { link: LinkWithCollection }) => (
	<Card className={styles.linkWrapper} radius="sm" withBorder>
		<Group justify="center" gap="xs">
			<LinkFavicon size={32} url={link.url} />
			<ExternalLinkStyled href={link.url} style={{ flex: 1 }}>
				<div className={styles.linkName}>
					<Text lineClamp={1}>{link.name} </Text>
				</div>
				<Text c="gray" size="xs" mb={4} lineClamp={1}>
					{link.collection.name}
				</Text>
			</ExternalLinkStyled>
			<LinkControls link={link} showGoToCollection />
		</Group>
	</Card>
);
