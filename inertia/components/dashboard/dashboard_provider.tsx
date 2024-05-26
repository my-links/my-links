import { router } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { ReactNode, useMemo, useState } from 'react';
import { ActiveCollectionContext } from '~/contexts/active_collection_context';
import CollectionsContext from '~/contexts/collections_context';
import FavoritesContext from '~/contexts/favorites_context';
import GlobalHotkeysContext from '~/contexts/global_hotkeys_context';
import useShortcut from '~/hooks/use_shortcut';
import { appendCollectionId } from '~/lib/navigation';
import { CollectionWithLinks, Link } from '~/types/app';

export default function DashboardProviders(
  props: Readonly<{
    children: ReactNode;
    collections: CollectionWithLinks[];
    activeCollection: CollectionWithLinks;
  }>
) {
  const [globalHotkeysEnabled, setGlobalHotkeysEnabled] =
    useState<boolean>(true);
  const [collections, setCollections] = useState<CollectionWithLinks[]>(
    props.collections
  );
  const [activeCollection, setActiveCollection] =
    useState<CollectionWithLinks | null>(
      props.activeCollection || collections?.[0]
    );

  const handleChangeCollection = (collection: CollectionWithLinks) => {
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
