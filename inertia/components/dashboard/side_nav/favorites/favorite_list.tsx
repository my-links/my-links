import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
import FavoriteItem from '~/components/dashboard/side_nav/favorites/favorite_item';
import useFavorites from '~/hooks/use_favorites';

const FavoriteListWrapper = styled.div({
  height: 'auto',
  width: '100%',
  marginBottom: '15px',
});

const FavoriteListLegend = styled.h4(({ theme }) => ({
  userSelect: 'none',
  textTransform: 'uppercase',
  fontSize: '0.85em',
  fontWeight: '500',
  color: theme.colors.grey,
  marginBottom: '5px',
}));

const FavoriteListStyle = styled(UnstyledList)({
  display: 'flex',
  gap: '5px',
  flexDirection: 'column',
});

export default function FavoriteList() {
  const { t } = useTranslation('common');
  const { favorites } = useFavorites();

  return (
    favorites.length !== 0 && (
      <FavoriteListWrapper>
        <FavoriteListLegend>{t('favorite')}</FavoriteListLegend>
        <FavoriteListStyle>
          {favorites.map((link) => (
            <FavoriteItem link={link} key={link.id} />
          ))}
        </FavoriteListStyle>
      </FavoriteListWrapper>
    )
  );
}
