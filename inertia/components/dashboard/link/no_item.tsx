import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import useActiveCollection from '~/hooks/use_active_collection';
import { appendCollectionId } from '~/lib/navigation';
import { fadeIn } from '~/styles/keyframes';

const NoCollectionStyle = styled.div({
  minWidth: 0,
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  animation: `${fadeIn} 0.3s both`,
});

const Text = styled.p({
  minWidth: 0,
  width: '100%',
  textAlign: 'center',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
});

export function NoCollection() {
  const { t } = useTranslation('home');
  return (
    <NoCollectionStyle>
      <Text>{t('select-collection')}</Text>
      <Link href={route('collection.create-form').url}>
        {t('or-create-one')}
      </Link>
    </NoCollectionStyle>
  );
}

export function NoLink() {
  const { t } = useTranslation('common');
  const { activeCollection } = useActiveCollection();
  return (
    <NoCollectionStyle>
      <Text
        dangerouslySetInnerHTML={{
          __html: t(
            'home:no-link',
            { name: activeCollection?.name ?? '' } as any,
            {
              interpolation: { escapeValue: false },
            }
          ),
        }}
      />
      <Link
        href={appendCollectionId(
          route('link.create-form').url,
          activeCollection?.id
        )}
      >
        {t('link.create')}
      </Link>
    </NoCollectionStyle>
  );
}
