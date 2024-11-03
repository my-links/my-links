import { Card, Group, Text } from '@mantine/core';
import { AiFillStar } from 'react-icons/ai';
import { ExternalLinkStyled } from '~/components/common/external_link_styled';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import { Link } from '~/types/app';
import styles from './link.module.css';

export default function LinkItem({
	link,
	showUserControls = false,
}: {
	link: Link;
	showUserControls: boolean;
}) {
	const { name, url, description, favorite } = link;
	return (
		<Card className={styles.linkWrapper} padding="sm" radius="sm" withBorder>
			<Group className={styles.linkHeader} justify="center">
				<LinkFavicon url={url} />
				<ExternalLinkStyled href={url} style={{ flex: 1 }}>
					<div className={styles.linkName}>
						<Text lineClamp={1}>
							{name}{' '}
							{showUserControls && favorite && <AiFillStar color="gold" />}
						</Text>
					</div>
					<LinkItemURL url={url} />
				</ExternalLinkStyled>
				{/* {showUserControls && <LinkControls link={link} />} */}
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
