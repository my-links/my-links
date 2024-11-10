import { Box, Card, Group, Text } from '@mantine/core';
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkFavicon from '~/components/dashboard/link/item/favicon/link_favicon';
import LinkControls from '~/components/dashboard/link/item/link_controls';
import { LinkWithCollection } from '~/types/app';
import styles from './favorite_item.module.css';

export const FavoriteItem = ({ link }: { link: LinkWithCollection }) => (
	<ExternalLinkStyled
		href={link.url}
		title={link.url}
		style={{ width: '260px', maxWidth: '100%' }}
	>
		<Card className={styles.linkWrapper}>
			<Group gap="xs" wrap="nowrap">
				<LinkFavicon size={32} url={link.url} />
				<Box maw="calc(100% - 80px)">
					<Text lineClamp={1} c="blue">
						{link.name}
					</Text>
					<Text c="gray" size="xs" mb={4} lineClamp={1}>
						{link.collection.name}
					</Text>
				</Box>
				<LinkControls link={link} showGoToCollection />
			</Group>
		</Card>
	</ExternalLinkStyled>
);
