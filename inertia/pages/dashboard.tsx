import KEYS from '#constants/keys';
import PATHS from '#constants/paths';
import type Collection from '#models/collection';
import Link from '#models/link';
import styled from '@emotion/styled';
import { router } from '@inertiajs/react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSwipeable } from 'react-swipeable';
import Links from '~/components/dashboard/link_list/link_list';
import SideNavigation from '~/components/dashboard/side_nav/side_navigation';
import SwiperHandler from '~/components/dashboard/swiper_handler';
import DashboardLayout from '~/components/layouts/dashboard_layout';
import { ActiveCollectionContext } from '~/contexts/active_collection_context';
import CollectionsContext from '~/contexts/collections_context';
import FavoritesContext from '~/contexts/favorites_context';
import GlobalHotkeysContext from '~/contexts/global_hotkeys_context';
import { useMediaQuery } from '~/hooks/use_media_query';
import useModal from '~/hooks/use_modal';

interface HomePageProps {
  collections: Collection[];
  activeCollection: Collection;
}

const SideBar = styled.div(({ theme }) => ({
  paddingRight: '0.75em',
  borderRight: `1px solid ${theme.colors.lightGrey}`,
  marginRight: '5px',
}));

export default function HomePage(props: Readonly<HomePageProps>) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isShowing, open, close } = useModal();
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
    <DashboardLayout>
      <HomeProviders
        collections={props.collections}
        activeCollection={props.activeCollection}
      >
        <SwiperHandler {...handlers}>
          {!isMobile && (
            <SideBar>
              <SideNavigation />
            </SideBar>
          )}
          <Links isMobile={isMobile} openSideMenu={open} />
        </SwiperHandler>
      </HomeProviders>
    </DashboardLayout>
  );
}
function HomeProviders(
  props: Readonly<{
    children: ReactNode;
    collections: Collection[];
    activeCollection: Collection;
  }>
) {
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] =
    useState<boolean>(true);
  const [collections, setCollections] = useState<Collection[]>(
    props.collections
  );
  const [activeCollection, setActiveCollection] = useState<Collection | null>(
    props.activeCollection || collections?.[0]
  );

  const handleChangeCollection = (collection: Collection) =>
    setActiveCollection(collection);

  const favorites = useMemo<Link[]>(
    () =>
      collections.reduce((acc, collection) => {
        collection.links.forEach((link) =>
          link.favorite ? acc.push(link) : null
        );
        return acc;
      }, [] as Link[]),
    [collections]
  );

  const collectionsContextValue = useMemo(
    () => ({ collections, setCollections }),
    [collections]
  );
  const activeCollectionContextValue = useMemo(
    () => ({ activeCollection, setActiveCollection: handleChangeCollection }),
    [activeCollection, handleChangeCollection]
  );
  const favoritesContextValue = useMemo(() => ({ favorites }), [favorites]);
  const globalHotkeysContextValue = useMemo(
    () => ({
      globalHotkeysEnabled: globalHotkeysEnabled,
      setGlobalHotkeysEnabled,
    }),
    [globalHotkeysEnabled]
  );

  useHotkeys(
    KEYS.OPEN_CREATE_LINK_KEY,
    () => {
      router.visit(`${PATHS.LINK.CREATE}?collectionId=${activeCollection?.id}`);
    },
    { enabled: globalHotkeysEnabled }
  );
  useHotkeys(
    KEYS.OPEN_CREATE_COLLECTION_KEY,
    () => {
      router.visit(PATHS.COLLECTION.CREATE);
    },
    { enabled: globalHotkeysEnabled }
  );
  return (
    <CollectionsContext.Provider value={collectionsContextValue}>
      <ActiveCollectionContext.Provider value={activeCollectionContextValue}>
        <FavoritesContext.Provider value={favoritesContextValue}>
          <GlobalHotkeysContext.Provider value={globalHotkeysContextValue}>
            {props.children}
          </GlobalHotkeysContext.Provider>
        </FavoritesContext.Provider>
      </ActiveCollectionContext.Provider>
    </CollectionsContext.Provider>
  );
}
