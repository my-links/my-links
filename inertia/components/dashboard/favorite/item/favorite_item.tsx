import { Card, Flex, Group, Text } from '@mantine/core';
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkFavicon from '~/components/dashboard/link/item/favicon/link_favicon';
import LinkControls from '~/components/dashboard/link/item/link_controls';
import { LinkWithCollection } from '~/types/app';
import styles from './favorite_item.module.css';

export const FavoriteItem = ({ link }: { link: LinkWithCollection }) => (
	<ExternalLinkStyled href={link.url} title={link.url}>
		<Card className={styles.linkWrapper}>
			<Group gap="xs" wrap="nowrap">
				<LinkFavicon url={link.url} />
				<Flex style={{ width: '100%' }} direction="column">
					<Text lineClamp={1} c="blue">
						{link.name}
					</Text>
					<Text
						c="gray"
						size="xs"
						mb={4}
						lineClamp={1}
						style={{ wordBreak: 'break-all' }}
					>
						{link.collection.name}
					</Text>
				</Flex>
				<LinkControls link={link} showGoToCollection />
			</Group>
		</Card>
	</ExternalLinkStyled>
);
