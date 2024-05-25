import type Collection from '#models/collection';
import Link from '#models/link';
import styled from '@emotion/styled';
import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import CollectionContainer from '~/components/dashboard/collection/collection_container';
import CollectionList from '~/components/dashboard/collection/list/collection_list';
import SideNavigation from '~/components/dashboard/side_nav/side_navigation';
import SwiperHandler from '~/components/dashboard/swiper_handler';
import DashboardLayout from '~/components/layouts/dashboard_layout';
import { ActiveCollectionContext } from '~/contexts/active_collection_context';
import CollectionsContext from '~/contexts/collections_context';
import FavoritesContext from '~/contexts/favorites_context';
import GlobalHotkeysContext from '~/contexts/global_hotkeys_context';
import { useMediaQuery } from '~/hooks/use_media_query';
import useToggle from '~/hooks/use_modal';
import useShortcut from '~/hooks/use_shortcut';
import { appendCollectionId } from '~/lib/navigation';

interface DashboardPageProps {
  collections: Collection[];
  activeCollection: Collection;
}

const SideBar = styled.div(({ theme }) => ({
  borderRight: `1px solid ${theme.colors.lightGrey}`,
  marginRight: '5px',
}));

export default function DashboardPage(props: Readonly<DashboardPageProps>) {
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
    <DashboardLayout>
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
    </DashboardLayout>
  );
}
function DashboardProviders(
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

  const handleChangeCollection = (collection: Collection) => {
    setActiveCollection(collection);
    router.visit(appendCollectionId(route('dashboard').url, collection.id));
  };

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
      globalHotkeysEnabled,
      setGlobalHotkeysEnabled,
    }),
    [globalHotkeysEnabled]
  );

  useShortcut(
    'OPEN_CREATE_LINK_KEY',
    () =>
      router.visit(
        appendCollectionId(route('link.create-form').url, activeCollection?.id)
      ),
    {
      enabled: globalHotkeysEnabled,
    }
  );
  useShortcut(
    'OPEN_CREATE_COLLECTION_KEY',
    () => router.visit(route('collection.create-form').url),
    {
      enabled: globalHotkeysEnabled,
    }
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
