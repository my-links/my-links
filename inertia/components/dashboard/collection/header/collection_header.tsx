import styled from '@emotion/styled';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import TextEllipsis from '~/components/common/text_ellipsis';
import { CollectionHeaderProps } from '~/components/dashboard/collection/collection_container';
import CollectionControls from '~/components/dashboard/collection/header/collection_controls';
import CollectionDescription from '~/components/dashboard/collection/header/collection_description';
import VisibilityBadge from '~/components/visibilty/visibilty';
import { useActiveCollection } from '~/store/collection_store';

const paddingLeft = '1.25em';
const paddingRight = '1.65em';

const CollectionHeaderWrapper = styled.div(({ theme }) => ({
	minWidth: 0,
	width: '100%',
	paddingInline: `${paddingLeft} ${paddingRight}`,
	marginBottom: '0.5em',

	[`@media (max-width: ${theme.media.tablet})`]: {
		paddingInline: 0,
		marginBottom: '1rem',
	},
}));

const CollectionHeaderStyle = styled.div({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',

	'& > svg': {
		display: 'flex',
	},
});

const CollectionName = styled.h2(({ theme }) => ({
	width: `calc(100% - (${paddingLeft} + ${paddingRight}))`,
	color: theme.colors.primary,
	display: 'flex',
	gap: '0.35em',
	alignItems: 'center',

	[`@media (max-width: ${theme.media.tablet})`]: {
		width: `calc(100% - (${paddingLeft} + ${paddingRight} + 1.75em))`,
	},
}));

const LinksCount = styled.div(({ theme }) => ({
	minWidth: 'fit-content',
	fontWeight: 300,
	fontSize: '0.8em',
	color: theme.colors.grey,
}));

export default function CollectionHeader({
	showButtons,
	showControls = true,
	openNavigationItem,
	openCollectionItem,
}: CollectionHeaderProps) {
	const { t } = useTranslation('common');
	const { activeCollection } = useActiveCollection();

	if (!activeCollection) return <Fragment />;

	const { name, links, visibility } = activeCollection;
	return (
		<CollectionHeaderWrapper>
			<CollectionHeaderStyle>
				{showButtons && openNavigationItem && openNavigationItem}
				<CollectionName title={name}>
					<TextEllipsis>{name}</TextEllipsis>
					{links.length > 0 && <LinksCount> — {links.length}</LinksCount>}
					<VisibilityBadge
						label={t('collection.visibility')}
						visibility={visibility}
					/>
				</CollectionName>
				{showControls && (
					<CollectionControls collectionId={activeCollection.id} />
				)}
				{showButtons && openCollectionItem && openCollectionItem}
			</CollectionHeaderStyle>
			{activeCollection.description && <CollectionDescription />}
		</CollectionHeaderWrapper>
	);
}
