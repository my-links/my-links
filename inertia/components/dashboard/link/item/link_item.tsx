import { Card, Group, Text } from '@mantine/core';
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
		<Card className={styles.linkWrapper} padding="sm" radius="sm" withBorder>
			<Group className={styles.linkHeader} justify="center">
				<LinkFavicon url={url} />
				<ExternalLinkStyled href={url} style={{ flex: 1 }}>
					<div className={styles.linkName}>
						<Text lineClamp={1}>
							{name} {showFavoriteIcon && <AiFillStar color="gold" />}
						</Text>
					</div>
					<LinkItemURL url={url} />
				</ExternalLinkStyled>
				{!hideMenu && <LinkControls link={link} />}
			</Group>
			{description && (
				<Text className={styles.linkDescription} c="dimmed" size="sm">
					{description}
				</Text>
			)}
		</Card>
	);
}

function LinkItemURL({ url }: { url: Link['url'] }) {
	try {
		const { origin, pathname, search } = new URL(url);
		let text = '';

		if (pathname !== '/') {
			text += pathname;
		}

		if (search !== '') {
			if (text === '') {
				text += '/';
			}
			text += search;
		}

		return (
			<Text className={styles.linkUrl} c="gray" size="xs" lineClamp={1}>
				{origin}
				<span className={styles.linkUrlPathname}>{text}</span>
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
