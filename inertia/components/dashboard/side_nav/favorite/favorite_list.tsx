import styled from '@emotion/styled';
import TextEllipsis from '~/components/common/text_ellipsis';
import LinkFavicon from '~/components/dashboard/link/link_favicon';
import FavoriteListContainer from '~/components/dashboard/side_nav/favorite/favorite_container';
import FavoriteItem from '~/components/dashboard/side_nav/favorite/favorite_item';
import useFavorites from '~/hooks/use_favorites';

const FavoriteLabel = styled.p(({ theme }) => ({
  color: theme.colors.grey,
}));

const NoFavorite = () => (
  <FavoriteLabel css={{ textAlign: 'center' }}>
    Your favorites will appear here
  </FavoriteLabel>
);

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
  const { favorites } = useFavorites();
  if (favorites.length === 0) {
    return <NoFavorite key="no-favorite" />;
  }

  return (
    <FavoriteListContainer>
      <FavoriteLabel css={{ marginBlock: '0.35em', paddingInline: '15px' }}>
        Favorites • {favorites.length}
      </FavoriteLabel>
      <FavoriteListStyle>
        {favorites.map(({ id, name, url }) => (
          <FavoriteItem href={url} key={id}>
            <LinkFavicon url={url} size={24} />
            <TextEllipsis>{name}</TextEllipsis>
          </FavoriteItem>
        ))}
      </FavoriteListStyle>
    </FavoriteListContainer>
  );
}
