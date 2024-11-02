import { Card, Group, Text } from '@mantine/core'; // Import de Mantine
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
		<Card
			className={styles.linkWrapper}
			padding="xs"
			pl="md"
			pr="md"
			radius="sm"
		>
			<Group className={styles.linkHeader} justify="space-between">
				<LinkFavicon url={url} />
				<ExternalLinkStyled href={url} style={{ flex: 1 }}>
					<div className={styles.linkName}>
						<Text c="blue" lineClamp={1}>
							{name}{' '}
							{showUserControls && favorite && <AiFillStar color="gold" />}
						</Text>
					</div>
					<LinkItemURL url={url} />
				</ExternalLinkStyled>
				{/* {showUserControls && <LinkControls link={link} />} */}
			</Group>
			{description && (
				<Text c="dimmed" size="sm">
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
