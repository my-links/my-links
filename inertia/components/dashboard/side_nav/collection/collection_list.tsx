import styled from '@emotion/styled';
import { useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
import CollectionItem from '~/components/dashboard/side_nav/collection/collection_item';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import useGlobalHotkeys from '~/hooks/use_global_hotkeys';
import Keys from '../../../../../app/constants/keys';

const CollectionListStyle = styled.div({
  height: '100%',
  width: '100%',
  minHeight: 0,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
});

export default function CollectionList() {
  const { t } = useTranslation();
  const { collections } = useCollections();
  const { activeCollection, setActiveCollection } = useActiveCollection();
  const { globalHotkeysEnabled } = useGlobalHotkeys();

  const linksCount = useMemo(
    () =>
      collections.reduce((acc, current) => (acc += current.links.length), 0),
    [collections]
  );

  useHotkeys(
    Keys.ARROW_UP,
    () => {
      const currentCollectionIndex = collections.findIndex(
        ({ id }) => id === activeCollection?.id
      );
      if (currentCollectionIndex === -1 || currentCollectionIndex === 0) return;

      setActiveCollection(collections[currentCollectionIndex - 1]);
    },
    { enabled: globalHotkeysEnabled }
  );

  useHotkeys(
    Keys.ARROW_DOWN,
    () => {
      const currentCollectionIndex = collections.findIndex(
        ({ id }) => id === activeCollection?.id
      );
      if (
        currentCollectionIndex === -1 ||
        currentCollectionIndex === collections.length - 1
      )
        return;

      setActiveCollection(collections[currentCollectionIndex + 1]);
    },
    { enabled: globalHotkeysEnabled }
  );

  return (
    <CollectionListStyle>
      <h4>
        {t('collection.collections', { count: linksCount })} • {linksCount}
      </h4>
      <DndProvider backend={HTML5Backend}>
        <ListOfCollections />
      </DndProvider>
    </CollectionListStyle>
  );
}

function ListOfCollections() {
  const [, drop] = useDrop(() => ({ accept: 'collection' }));
  const { collections } = useCollections();

  return (
    <UnstyledList
      css={{
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      // @ts-ignore
      ref={drop}
    >
      {collections.map((collection, index) => (
        <CollectionItem
          collection={collection}
          key={collection.id}
          index={index}
        />
      ))}
    </UnstyledList>
  );
}
