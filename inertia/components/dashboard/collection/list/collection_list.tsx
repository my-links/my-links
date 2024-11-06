import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import CollectionItem from '~/components/dashboard/collection/list/collection_item';
import CollectionListContainer from '~/components/dashboard/collection/list/collection_list_container';
import useShortcut from '~/hooks/use_shortcut';
import { useActiveCollection, useCollections } from '~/store/collection_store';

const SideMenu = styled.nav(({ theme }) => ({
	height: '100%',
	width: '300px',
	backgroundColor: theme.colors.background,
	paddingLeft: '10px',
	marginLeft: '5px',
	borderLeft: `1px solid ${theme.colors.lightGrey}`,
	display: 'flex',
	gap: '.35em',
	flexDirection: 'column',
}));

const CollectionLabel = styled.p(({ theme }) => ({
	color: theme.colors.grey,
	marginBlock: '0.35em',
	paddingInline: '15px',
}));

const CollectionListStyle = styled.div({
	padding: '1px',
	paddingRight: '5px',
	display: 'flex',
	flex: 1,
	gap: '.35em',
	flexDirection: 'column',
	overflow: 'auto',
});

export default function CollectionList() {
	const { t } = useTranslation('common');
	const { collections } = useCollections();
	const { activeCollection, setActiveCollection } = useActiveCollection();

	const goToPreviousCollection = () => {
		const currentCategoryIndex = collections.findIndex(
			({ id }) => id === activeCollection?.id
		);
		if (currentCategoryIndex === -1 || currentCategoryIndex === 0) return;

		setActiveCollection(collections[currentCategoryIndex - 1]);
	};

	const goToNextCollection = () => {
		const currentCategoryIndex = collections.findIndex(
			({ id }) => id === activeCollection?.id
		);
		if (
			currentCategoryIndex === -1 ||
			currentCategoryIndex === collections.length - 1
		)
			return;

		setActiveCollection(collections[currentCategoryIndex + 1]);
	};

	useShortcut('ARROW_UP', goToPreviousCollection);
	useShortcut('ARROW_DOWN', goToNextCollection);

	return (
		<SideMenu>
			<CollectionListContainer>
				<CollectionLabel>
					{t('collection.collections', { count: collections.length })} •{' '}
					{collections.length}
				</CollectionLabel>
				<CollectionListStyle>
					{collections.map((collection) => (
						<CollectionItem collection={collection} key={collection.id} />
					))}
				</CollectionListStyle>
			</CollectionListContainer>
		</SideMenu>
	);
}
