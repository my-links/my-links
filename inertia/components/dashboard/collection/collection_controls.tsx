import styled from '@emotion/styled';
import QuickResourceAction from '~/components/dashboard/quick_action/quick_action';
import useActiveCollection from '~/hooks/use_active_collection';

const CollectionControlsStyle = styled.span({
  display: 'flex',
  gap: '0.5em',
  alignItems: 'center',
});

export default function CollectionControls() {
  const { activeCollection } = useActiveCollection();
  return (
    activeCollection && (
      <CollectionControlsStyle>
        <QuickResourceAction
          resource="link"
          action="create"
          collectionId={activeCollection.id}
        />
        <QuickResourceAction
          resource="collection"
          action="edit"
          resourceId={activeCollection.id}
        />
        <QuickResourceAction
          resource="collection"
          action="remove"
          resourceId={activeCollection.id}
        />
      </CollectionControlsStyle>
    )
  );
}
