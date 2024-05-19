import styled from '@emotion/styled';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionDescriptionStyle = styled.p({
  fontSize: '0.85rem',
  marginBottom: '0.5rem',
});

export default function CollectionDescription() {
  const { activeCollection } = useActiveCollection();
  return (
    activeCollection && (
      <CollectionDescriptionStyle>
        {activeCollection?.description}
      </CollectionDescriptionStyle>
    )
  );
}
