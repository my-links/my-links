import styled from '@emotion/styled';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionDescriptionStyle = styled.p({
  fontSize: '0.85em',
  marginBottom: '0.5em',
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
