import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import dayjs from 'dayjs';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import RoundedImage from '~/components/common/rounded_image';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
import { DATE_FORMAT } from '~/constants';
import useUser from '~/hooks/use_user';

const ProfileStyle = styled(UnstyledList)({
  display: 'flex',
  gap: '1.25em',
});

const Column = styled.li({
  display: 'flex',
  gap: '1rem',
  flexDirection: 'column',
});

const Field = styled.li({
  display: 'flex',
  flexDirection: 'column',
});

export default function Profile() {
  const { user, isAuthenticated } = useUser();
  const { t } = useTranslation('common');

  const avatarLabel = t('avatar', {
    name: user?.name,
  });

  if (!isAuthenticated) {
    return <Fragment />;
  }

  return (
    <ProfileStyle>
      <Column>
        <RoundedImage
          src={user.avatarUrl}
          width={96}
          height={96}
          alt={avatarLabel}
          title={avatarLabel}
        />
        <Link href={route('auth.logout').url}>{t('logout')}</Link>
      </Column>
      <Column>
        <Field>
          <b>{t('name')}</b> {user.fullname}
        </Field>
        <Field>
          <b>{t('email')}</b> {user.email}
        </Field>
        <Field>
          <b>{t('member-since')}</b>{' '}
          {dayjs(user.createdAt.toString()).format(DATE_FORMAT)}
        </Field>
      </Column>
    </ProfileStyle>
  );
}
