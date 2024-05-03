import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { MdAdminPanelSettings } from 'react-icons/md';
import RoundedImage from '~/components/common/rounded_image';
import useUser from '~/hooks/use_user';

const UserCardWrapper = styled.div(({ theme }) => ({
  userSelect: 'none',
  height: 'fit-content',
  width: '100%',
  color: theme.colors.black,
  backgroundColor: theme.colors.white,
  border: `1px solid ${theme.colors.lightestGrey}`,
  padding: '7px 12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  '& button, & a': {
    cursor: 'pointer',
    color: theme.colors.blue,
    display: 'flex',
    transition: theme.transition.delay,

    '&:hover': {
      transform: 'scale(1.3)',
    },
  },
}));

const UserCardStyle = styled.div({
  display: 'flex',
  gap: '0.5em',
  alignItems: 'center',
});

const UserControls = styled.div({
  display: 'flex',
  gap: '0.35em',
});

export default function UserCard() {
  const { user } = useUser();
  const { t } = useTranslation('common');

  const avatarLabel = t('avatar', {
    name: user.name,
  });
  return (
    <UserCardWrapper>
      <UserCardStyle>
        <RoundedImage
          src={user.avatarUrl}
          width={28}
          height={28}
          alt={avatarLabel}
          title={avatarLabel}
        />
        {user.nickName}
      </UserCardStyle>
      <UserControls>
        {user.is_admin && (
          <Link href={PATHS.ADMIN} className="reset">
            <MdAdminPanelSettings color="red" size={24} />
          </Link>
        )}
        {/* <SettingsModal /> */}
      </UserControls>
    </UserCardWrapper>
  );
}
