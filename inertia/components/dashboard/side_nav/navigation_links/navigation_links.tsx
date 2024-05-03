import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import useActiveCollection from '~/hooks/use_active_collection';

const MenuControls = styled.div({
  margin: '10px 0',
  display: 'flex',
  gap: '0.25em',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
});

const MenuAction = styled.div({
  fontSize: '0.95em',
  display: 'flex',
  gap: '0.5em',
});

export default function NavigationLinks() {
  const { t } = useTranslation('common');
  const { activeCollection } = useActiveCollection();

  return (
    <MenuControls>
      {/* <MenuAction>
        <SearchModal>{t('common:search')}</SearchModal>
        <kbd>S</kbd>
      </MenuAction> */}
      <MenuAction>
        <Link href={PATHS.COLLECTION.CREATE}>{t('collection.create')}</Link>
        <kbd>C</kbd>
      </MenuAction>
      <MenuAction>
        <Link
          href={`${PATHS.LINK.CREATE}?collectionId=${activeCollection?.id}`}
        >
          {t('link.create')}
        </Link>
        <kbd>L</kbd>
      </MenuAction>
    </MenuControls>
  );
}
