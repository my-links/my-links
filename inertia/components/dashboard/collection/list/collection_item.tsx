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
      <FolderIcon size={24} />
      <TextEllipsis>{collection.name}</TextEllipsis>
    </CollectionItemStyle>
  );
}
