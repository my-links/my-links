import type Collection from '#models/collection';
import styled from '@emotion/styled';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import TextEllipsis from '~/components/common/text_ellipsis';
import { Item } from '~/components/dashboard/side_nav/nav_item';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionItemStyle = styled(Item)<{ isActive: boolean }>(
  ({ theme, isActive }) => ({
    cursor: 'pointer',
    color: isActive ? theme.colors.primary : theme.colors.font,
    backgroundColor: theme.colors.secondary,
  })
);

const LinksCount = styled.div(({ theme }) => ({
  minWidth: 'fit-content',
  fontWeight: 300,
  fontSize: '0.9rem',
  color: theme.colors.grey,
}));

export default function CollectionItem({
  collection,
}: {
  collection: Collection;
}) {
  const { activeCollection, setActiveCollection } = useActiveCollection();
  const isActiveCollection = collection.id === activeCollection?.id;
  const FolderIcon = isActiveCollection ? AiFillFolderOpen : AiOutlineFolder;

  return (
    <CollectionItemStyle
      onClick={() => setActiveCollection(collection)}
      isActive={isActiveCollection}
    >
      <FolderIcon css={{ minWidth: '24px' }} size={24} />
      <TextEllipsis>{collection.name}</TextEllipsis>
      {collection.links.length > 0 && (
        <LinksCount>— {collection.links.length}</LinksCount>
      )}
    </CollectionItemStyle>
  );
}
