import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import TextEllipsis from '~/components/common/text_ellipsis';
import CollectionItem from '~/components/dashboard/collection/list/collection_item';
import CollectionListContainer from '~/components/dashboard/collection/list/collection_list_container';
import useActiveCollection from '~/hooks/use_active_collection';
import useCollections from '~/hooks/use_collections';

const SideMenu = styled.nav(({ theme }) => ({
  height: '100%',
  paddingLeft: '10px',
  marginLeft: '5px',
  borderLeft: `1px solid ${theme.colors.lightGrey}`,
  display: 'flex',
  gap: '.35em',
  flexDirection: 'column',
}));

const CollectionLabel = styled.p(({ theme }) => ({
  color: theme.colors.grey,
}));
const CollectionListStyle = styled.div({
  padding: '1px',
  paddingRight: '5px',
  display: 'flex',
  flex: 1,
  gap: '.35em',
  flexDirection: 'column',
  overflow: 'auto',
});

export default function CollectionList() {
  const { activeCollection, setActiveCollection } = useActiveCollection();
  const { collections } = useCollections();
  const theme = useTheme();
  return (
    <SideMenu>
      <CollectionListContainer>
        <CollectionLabel>Collections • {collections.length}</CollectionLabel>
        <CollectionListStyle>
          {collections.map((collection) => (
            <CollectionItem
              css={{
                cursor: 'pointer',
                color:
                  activeCollection?.id === collection.id
                    ? theme.colors.primary
                    : theme.colors.font,
              }}
              onClick={() => setActiveCollection(collection)}
              key={collection.id}
            >
              {collection.id === activeCollection?.id ? (
                <AiFillFolderOpen size={24} />
              ) : (
                <AiOutlineFolder size={24} />
              )}
              <TextEllipsis>{collection.name}</TextEllipsis>
            </CollectionItem>
          ))}
        </CollectionListStyle>
      </CollectionListContainer>
    </SideMenu>
  );
}
