import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useEffect, useRef } from 'react';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import TextEllipsis from '~/components/common/text_ellipsis';
import { Item } from '~/components/dashboard/side_nav/nav_item';
import useActiveCollection from '~/hooks/use_active_collection';
import { appendCollectionId } from '~/lib/navigation';
import { CollectionWithLinks } from '~/types/app';

const CollectionItemStyle = styled(Item, {
  shouldForwardProp: (propName) => propName !== 'isActive',
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  cursor: 'pointer',
  color: isActive ? theme.colors.primary : theme.colors.font,
  backgroundColor: theme.colors.secondary,
}));
const CollectionItemLink = CollectionItemStyle.withComponent(Link);

const LinksCount = styled.div(({ theme }) => ({
  minWidth: 'fit-content',
  fontWeight: 300,
  fontSize: '0.9rem',
  color: theme.colors.grey,
}));

export default function CollectionItem({
  collection,
}: {
  collection: CollectionWithLinks;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const { activeCollection } = useActiveCollection();
  const isActiveCollection = collection.id === activeCollection?.id;
  const FolderIcon = isActiveCollection ? AiFillFolderOpen : AiOutlineFolder;

  useEffect(() => {
    if (collection.id === activeCollection?.id) {
      itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [collection.id, activeCollection?.id]);

  return (
    <CollectionItemLink
      href={appendCollectionId(route('dashboard').url, collection.id)}
      isActive={isActiveCollection}
      ref={itemRef}
    >
      <FolderIcon css={{ minWidth: '24px' }} size={24} />
      <TextEllipsis>{collection.name}</TextEllipsis>
      {collection.links.length > 0 && (
        <LinksCount>— {collection.links.length}</LinksCount>
      )}
    </CollectionItemLink>
  );
}
