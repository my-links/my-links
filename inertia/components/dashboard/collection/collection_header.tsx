import styled from '@emotion/styled';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import VisibilityBadge from '~/components/visibilty/visibilty';
import useActiveCollection from '~/hooks/use_active_collection';

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
    <CollectionNameWrapper>
      <CollectionName>{name}</CollectionName>
      {links.length > 0 && <LinksCount> — {links.length}</LinksCount>}
      <VisibilityBadge
        label={t('collection.visibility')}
        visibility={visibility}
      />
    </CollectionNameWrapper>
  );
}
