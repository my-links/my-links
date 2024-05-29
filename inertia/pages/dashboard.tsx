import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode, useEffect } from 'react';
import { CiMenuBurger } from 'react-icons/ci';
import { useSwipeable } from 'react-swipeable';
import CollectionContainer from '~/components/dashboard/collection/collection_container';
import CollectionList from '~/components/dashboard/collection/list/collection_list';
import DashboardProviders from '~/components/dashboard/dashboard_provider';
import SideNavigation from '~/components/dashboard/side_nav/side_navigation';
import SwiperHandler from '~/components/dashboard/swiper_handler';
import DashboardLayout from '~/components/layouts/dashboard_layout';
import { useMediaQuery } from '~/hooks/use_media_query';
import useToggle from '~/hooks/use_modal';
import { rgba } from '~/lib/color';
import { CollectionWithLinks } from '~/types/app';

interface DashboardPageProps {
  collections: CollectionWithLinks[];
  activeCollection: CollectionWithLinks;
}

const SideBar = styled.div<{
  floating?: boolean;
  opened: boolean;
}>(({ theme, opened, floating = false }) => ({
  zIndex: 9,
  position: floating ? 'absolute' : 'unset',
  top: 0,
  height: '100%',
  width: opened ? '100%' : 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  transition: 'left 0.15s, right 0.15s',

  '&::before': {
    zIndex: -1,
    position: floating ? 'absolute' : 'unset',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    background: rgba(theme.colors.black, 0.35),
    backdropFilter: 'blur(0.1em)',
    content: '""',
    display: opened ? 'block' : 'none',
  },
}));

const LeftSideBar = styled(SideBar)(({ opened }) => ({
  left: opened ? 0 : '-100%',
}));

const RightSideBar = styled(SideBar)(({ opened }) => ({
  right: opened ? 0 : '-100%',
  alignItems: 'flex-end',
}));

function DashboardPage(props: Readonly<DashboardPageProps>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.media.mobile})`);
  const isTablet = useMediaQuery(`(max-width: ${theme.media.tablet})`);

  const {
    isShowing: isNavigationOpen,
    open: openNavigation,
    close: closeNavigation,
  } = useToggle();
  const {
    isShowing: isCollectionListOpen,
    open: openCollectionList,
    close: closeCollectionList,
  } = useToggle();

  const handleSwipeLeft = () => {
    if (!isMobile && !isTablet) return;
    if (isNavigationOpen) {
      closeNavigation();
    } else {
      openCollectionList();
    }
  };

  const handleSwipeRight = () => {
    if (!isMobile && !isTablet) return;
    if (isCollectionListOpen) {
      closeCollectionList();
    } else {
      openNavigation();
    }
  };

  const handlers = useSwipeable({
    trackMouse: true,
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
  });

  useEffect(() => {
    if (!isMobile && !isTablet) {
      closeCollectionList();
      closeNavigation();
    }
  }, [isMobile, isTablet, closeCollectionList, closeNavigation]);

  console.log(isMobile, isTablet, isNavigationOpen, isCollectionListOpen);
  return (
    <DashboardProviders
      collections={props.collections}
      activeCollection={props.activeCollection}
    >
      <SwiperHandler {...handlers}>
        <LeftSideBar
          opened={isNavigationOpen}
          floating={isMobile || isTablet}
          onClick={closeNavigation}
        >
          <SideNavigation />
        </LeftSideBar>
        <CollectionContainer
          openNavigationItem={
            <CiMenuBurger
              size={24}
              onClick={openNavigation}
              css={{
                cursor: 'pointer',
                marginRight: '1em',
                color: theme.colors.primary,
              }}
            />
          }
          openCollectionItem={
            <CiMenuBurger
              size={24}
              onClick={openCollectionList}
              css={{
                cursor: 'pointer',
                marginLeft: '1em',
                color: theme.colors.primary,
              }}
            />
          }
          showButtons={isMobile || isTablet}
        />
        <RightSideBar
          opened={isCollectionListOpen}
          floating={isMobile || isTablet}
          onClick={closeCollectionList}
        >
          <CollectionList />
        </RightSideBar>
      </SwiperHandler>
    </DashboardProviders>
  );
}

DashboardPage.layout = (page: ReactNode) => <DashboardLayout children={page} />;
export default DashboardPage;
