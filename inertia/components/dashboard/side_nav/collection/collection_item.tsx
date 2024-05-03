import PATHS from '#constants/paths';
import type Collection from '#models/collection';
import styled from '@emotion/styled';
import { useCallback, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import VisibilityBadge from '~/components/dashboard/side_nav/visibilty/visibilty';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';
import { arrayMove } from '~/lib/array';
import sortCcollectionsByNextId from '~/lib/collection';
import { makeRequest } from '~/lib/request';

interface CollectionItemProps {
  collection: Collection;
  index: number;
}

type CollectionDragItem = {
  collectionId: Collection['id'];
  index: number;
};

const CollectionItemStyle = styled.li<{ active: boolean }>(
  ({ theme, active }) => ({
    color: active ? theme.colors.blue : theme.colors.font,
    borderBottom: active
      ? `'2px solid ${theme.colors.lightestGrey} !important'`
      : '2px solid transparent !important',
    display: 'flex',
    gap: '0.25em',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: `${theme.transition.delay} box-shadow`,

    '&:hover': {
      color: theme.colors.blue,
    },
  })
);

const CollectionContent = styled.div({
  width: 'calc(100% - 24px)',
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
});

const CollectionNameWrapper = styled.div({
  minWidth: 0,
  width: '100%',
  display: 'flex',
  gap: '0.35em',
  flex: 1,
  alignItems: 'center',
});

const CollectionName = styled.div({
  minWidth: 0,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

const CollectionLinksCount = styled.div(({ theme }) => ({
  minWidth: 'fit-content',
  fontSize: '0.85em',
  color: theme.colors.grey,
}));

export default function CollectionItem({
  collection,
  index,
}: Readonly<CollectionItemProps>): JSX.Element {
  const { activeCollection, setActiveCollection } = useActiveCollection();
  const { collections, setCollections } = useCollections();
  const { t } = useTranslation();

  const ref = useRef<HTMLLIElement>();

  const sendMoveCollectionRequest = useCallback(
    async (currentCollection: Collection, nextId?: string) => {
      if (currentCollection.id === nextId) return;

      await makeRequest({
        url: `${PATHS.API.COLLECTION}/${currentCollection.id}`,
        method: 'PUT',
        body: {
          name: currentCollection.name,
          nextId,
        },
      });

      // @ts-ignore
      setCollections((prevCollections) => {
        const newCollections = [...prevCollections];
        const collectionIndex = newCollections.findIndex(
          (c) => c.id === currentCollection.id
        );

        const previousCollectionIndex = newCollections.findIndex(
          (c) => c.nextId === currentCollection.id
        );
        const prevNextCollectionIndex = newCollections.findIndex(
          (c) => c.nextId === nextId
        );

        newCollections[collectionIndex] = {
          ...newCollections[collectionIndex],
          nextId,
        };
        if (previousCollectionIndex !== -1) {
          newCollections[previousCollectionIndex] = {
            ...newCollections[previousCollectionIndex],
            nextId: currentCollection.nextId,
          };
        }
        if (prevNextCollectionIndex !== -1) {
          newCollections[prevNextCollectionIndex] = {
            ...newCollections[prevNextCollectionIndex],
            nextId: currentCollection.id,
          };
        }

        return sortCcollectionsByNextId(newCollections);
      });
    },
    [setCollections]
  );
  const moveCollection = useCallback(
    (currentIndex: number, newIndex: number) => {
      // @ts-ignore
      setCollections((prevCollections: Collection[]) =>
        arrayMove(prevCollections, currentIndex, newIndex)
      );
    },
    [setCollections]
  );

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const [_, drop] = useDrop({
    accept: 'collection',
    hover: (dragItem: CollectionDragItem) => {
      if (ref.current && dragItem.collectionId !== collection.id) {
        moveCollection(dragItem.index, index);
        dragItem.index = index;
      }
    },
    drop: (item) => {
      const currentCollection = collections.find(
        (c) => c.id === item.collectionId
      );
      const nextCollection = collections[item.index + 1];
      if (
        currentCollection?.nextId === null &&
        nextCollection?.id === undefined
      )
        return;
      if (currentCollection?.nextId !== nextCollection?.id) {
        sendMoveCollectionRequest(
          currentCollection!,
          nextCollection?.id ?? null
        );
      }
    },
  });

  const [{ opacity }, drag] = useDrag({
    type: 'collection',
    item: () => ({ index, collectionId: collection.id }),
    collect: (monitor: any) => ({
      opacity: monitor.isDragging() ? 0.1 : 1,
    }),
    end: (dragItem: CollectionDragItem, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        moveCollection(dragItem.index, index);
      }
    },
  });

  useEffect(() => {
    if (collection.id === activeCollection?.id) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [collection.id, activeCollection?.id]);

  drag(drop(ref));

  return (
    <CollectionItemStyle
      style={{
        transition: 'none',
        opacity,
      }}
      onClick={() => setActiveCollection(collection)}
      title={collection.name}
      active={collection.id === activeCollection?.id}
      // @ts-ignore
      ref={ref}
    >
      {collection.id === activeCollection?.id ? (
        <AiFillFolderOpen size={24} />
      ) : (
        <AiOutlineFolder size={24} />
      )}

      <CollectionContent>
        <CollectionNameWrapper>
          <CollectionName>{collection.name}</CollectionName>
          <CollectionLinksCount>
            — {collection.links.length}
          </CollectionLinksCount>
        </CollectionNameWrapper>
        <VisibilityBadge
          label={t('common:collection.visibility')}
          visibility={collection.visibility}
        />
      </CollectionContent>
    </CollectionItemStyle>
  );
}
