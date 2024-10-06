import styled from '@emotion/styled';
import LinkItem from '~/components/dashboard/link/link_item';
import { NoLink } from '~/components/dashboard/link/no_item';
import { sortByCreationDate } from '~/lib/array';
import { Link } from '~/types/app';

const LinkListStyle = styled.ul({
	height: '100%',
	width: '100%',
	minWidth: 0,
	display: 'flex',
	flex: 1,
	gap: '0.5em',
	padding: '3px',
	flexDirection: 'column',
	overflowX: 'hidden',
	overflowY: 'scroll',
});

export default function LinkList({
	links,
	showControls = true,
}: {
	links: Link[];
	showControls?: boolean;
}) {
	if (links.length === 0) {
		return <NoLink />;
	}

	return (
		<LinkListStyle>
			{sortByCreationDate(links).map((link) => (
				<LinkItem link={link} key={link.id} showUserControls={showControls} />
			))}
		</LinkListStyle>
	);
}
