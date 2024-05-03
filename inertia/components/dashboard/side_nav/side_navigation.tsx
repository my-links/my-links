import styled from '@emotion/styled';
import CollectionList from '~/components/dashboard/side_nav/collection/collection_list';
import FavoriteList from '~/components/dashboard/side_nav/favorites/favorite_list';
import NavigationLinks from '~/components/dashboard/side_nav/navigation_links/navigation_links';
import UserCard from '~/components/dashboard/side_nav/user_card/user_card';

const SideMenu = styled.nav({
  height: '100%',
  width: '325px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  overflow: 'hidden',
});

const BlockWrapper = styled.section(({ theme }) => ({
  height: 'auto',
  width: '100%',

  '& h4': {
    userSelect: 'none',
    textTransform: 'uppercase',
    fontSize: '0.85em',
    fontWeight: 500,
    color: theme.colors.grey,
    marginBottom: '5px',
  },

  '& ul': {
    flex: 1,
    animation: 'fadein 0.3s both',
  },

  '& ul li': {
    position: 'relative',
    userSelect: 'none',
    cursor: 'pointer',
    height: 'fit-content',
    width: '100%',
    fontSize: '0.9em',
    backgroundColor: theme.colors.white,
    padding: '0.5em 1em',
    borderBottom: `2px solid ${theme.colors.lightestGrey}`,
    borderRadius: theme.border.radius,
    transition: theme.transition.delay,

    '&:not(:last-child)': {
      marginBottom: '5px',
    },
  },
}));

const SideNavigation = () => (
  <SideMenu>
    <BlockWrapper>
      <FavoriteList />
    </BlockWrapper>
    <BlockWrapper css={{ minHeight: '0', flex: '1' }}>
      <CollectionList />
    </BlockWrapper>
    <BlockWrapper>
      <NavigationLinks />
    </BlockWrapper>
    <BlockWrapper>
      <UserCard />
    </BlockWrapper>
  </SideMenu>
);

export default SideNavigation;
