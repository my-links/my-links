import styled from '@emotion/styled';
import { ReactNode, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import CollectionContainer from '~/components/dashboard/collection/collection_container';
import CollectionList from '~/components/dashboard/collection/list/collection_list';
import DashboardProviders from '~/components/dashboard/dashboard_provider';
import SideNavigation from '~/components/dashboard/side_nav/side_navigation';
import SwiperHandler from '~/components/dashboard/swiper_handler';
import DashboardLayout from '~/components/layouts/dashboard_layout';
import { useMediaQuery } from '~/hooks/use_media_query';
import useToggle from '~/hooks/use_modal';
import { CollectionWithLinks } from '~/types/app';

interface DashboardPageProps {
  collections: CollectionWithLinks[];
  activeCollection: CollectionWithLinks;
}

const SideBar = styled.div(({ theme }) => ({
  borderRight: `1px solid ${theme.colors.lightGrey}`,
  marginRight: '5px',
}));

function DashboardPage(props: Readonly<DashboardPageProps>) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isShowing, open, close } = useToggle();
  const handlers = useSwipeable({
    trackMouse: true,
    onSwipedRight: open,
  });

  useEffect(() => {
    if (!isMobile && isShowing) {
      close();
    }
  }, [close, isMobile, isShowing]);

  return (
    <DashboardProviders
      collections={props.collections}
      activeCollection={props.activeCollection}
    >
      <SwiperHandler {...handlers}>
        {!isMobile && (
          <SideBar>
            <SideNavigation />
          </SideBar>
        )}
        <CollectionContainer isMobile={isMobile} openSideMenu={open} />
        <CollectionList />
      </SwiperHandler>
    </DashboardProviders>
  );
}

DashboardPage.layout = (page: ReactNode) => <DashboardLayout children={page} />;
export default DashboardPage;
