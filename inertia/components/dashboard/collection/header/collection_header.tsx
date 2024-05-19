import styled from '@emotion/styled';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import TextEllipsis from '~/components/common/text_ellipsis';
import CollectionControls from '~/components/dashboard/collection/header/collection_controls';
import CollectionDescription from '~/components/dashboard/collection/header/collection_description';
import VisibilityBadge from '~/components/visibilty/visibilty';
import useActiveCollection from '~/hooks/use_active_collection';

const paddingLeft = '1.25em';
const paddingRight = '1.65em';

const CollectionHeaderWrapper = styled.div({
  minWidth: 0,
  width: '100%',
  paddingInline: `${paddingLeft} ${paddingRight}`,
});

const CollectionHeaderStyle = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  '& > svg': {
    display: 'flex',
  },
});

const CollectionName = styled.h2(({ theme }) => ({
  width: `calc(100% - (${paddingLeft} + ${paddingRight}))`,
  color: theme.colors.primary,
  display: 'flex',
  gap: '0.35em',
  alignItems: 'center',
}));

const LinksCount = styled.div(({ theme }) => ({
  minWidth: 'fit-content',
  fontWeight: 300,
  fontSize: '0.8em',
  color: theme.colors.grey,
}));

export default function CollectionHeader() {
  const { t } = useTranslation('common');
  const { activeCollection } = useActiveCollection();

  if (!activeCollection) return <Fragment />;

  const { name, links, visibility } = activeCollection;
  return (
    <CollectionHeaderWrapper>
      <CollectionHeaderStyle>
        <CollectionName title={name}>
          <TextEllipsis>{name}</TextEllipsis>
          {links.length > 0 && <LinksCount> — {links.length}</LinksCount>}
          <VisibilityBadge
            label={t('collection.visibility')}
            visibility={visibility}
          />
        </CollectionName>
        <CollectionControls collectionId={activeCollection.id} />
      </CollectionHeaderStyle>
      <CollectionDescription />
    </CollectionHeaderWrapper>
  );
}
