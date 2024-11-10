import { Card, Flex, Group, Text } from '@mantine/core';
import { AiFillStar } from 'react-icons/ai';
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkFavicon from '~/components/dashboard/link/item/favicon/link_favicon';
import LinkControls from '~/components/dashboard/link/item/link_controls';
import type { LinkListProps } from '~/components/dashboard/link/list/link_list';
import { Link, PublicLink } from '~/types/app';
import styles from './link.module.css';

interface LinkItemProps extends LinkListProps {
	link: Link | PublicLink;
}

export function LinkItem({ link, hideMenu: hideMenu = false }: LinkItemProps) {
	const { name, url, description } = link;
	const showFavoriteIcon = !hideMenu && 'favorite' in link && link.favorite;
	return (
		<ExternalLinkStyled href={url} title={url}>
			<Card className={styles.linkWrapper}>
				<Group justify="center" wrap="nowrap">
					<LinkFavicon url={url} />
					<Flex style={{ width: '100%' }} direction="column">
						<Text lineClamp={1} c="blue">
							{name} {showFavoriteIcon && <AiFillStar color="gold" />}
						</Text>
						<LinkItemURL url={url} />
					</Flex>
					{!hideMenu && <LinkControls link={link} />}
				</Group>
				{description && (
					<Text c="dimmed" size="sm" mt="xs" lineClamp={3}>
						{description}
					</Text>
				)}
			</Card>
		</ExternalLinkStyled>
	);
}

function LinkItemURL({ url }: { url: Link['url'] }) {
	try {
		const { origin, pathname } = new URL(url);
		return (
			<Text className={styles.linkUrl} c="gray" size="xs" lineClamp={1}>
				{origin}
				{pathname !== '/' && pathname}
			</Text>
		);
	} catch (error) {
		console.error('error', error);
		return (
			<Text className={styles.linkUrl} c="gray" size="xs" lineClamp={1}>
				{url}
			</Text>
		);
	}
}
