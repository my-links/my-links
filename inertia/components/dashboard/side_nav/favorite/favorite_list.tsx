import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import FavoriteListContainer from '~/components/dashboard/side_nav/favorite/favorite_container';
import FavoriteItem from '~/components/dashboard/side_nav/favorite/favorite_item';
import { useFavorites } from '~/store/collection_store';

const FavoriteLabel = styled.p(({ theme }) => ({
	color: theme.colors.grey,
	marginBlock: '0.35em',
	paddingInline: '15px',
}));

const NoFavorite = () => {
	const { t } = useTranslation('common');
	return (
		<FavoriteLabel css={{ textAlign: 'center' }}>
			{t('favorites-appears-here')}
		</FavoriteLabel>
	);
};

const FavoriteListStyle = styled.div({
	padding: '1px',
	paddingRight: '5px',
	display: 'flex',
	flex: 1,
	gap: '.35em',
	flexDirection: 'column',
	overflow: 'auto',
});

export default function FavoriteList() {
	const { t } = useTranslation('common');
	const { favorites } = useFavorites();
	if (favorites.length === 0) {
		return <NoFavorite key="no-favorite" />;
	}

	return (
		<FavoriteListContainer>
			<FavoriteLabel>
				{t('favorite')} • {favorites.length}
			</FavoriteLabel>
			<FavoriteListStyle>
				{favorites.map((link) => (
					<FavoriteItem link={link} key={link.id} />
				))}
			</FavoriteListStyle>
		</FavoriteListContainer>
	);
}
