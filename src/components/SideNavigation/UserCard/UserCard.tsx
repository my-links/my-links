import RoundedImage from 'components/RoundedImage/RoundedImage';
import SettingsModal from 'components/Settings/SettingsModal';
import PATHS from 'constants/paths';
import useUser from 'hooks/useUser';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { MdAdminPanelSettings } from 'react-icons/md';
import styles from './user-card.module.scss';

export default function UserCard() {
  const { user } = useUser();
  const { t } = useTranslation();

  const avatarLabel = t('common:avatar', {
    name: user.name,
  });
  return (
    <div className={styles['user-card-wrapper']}>
      <div className={styles['user-card']}>
        <RoundedImage
          src={user.image}
          width={28}
          height={28}
          alt={avatarLabel}
          title={avatarLabel}
        />
        {user.name}
      </div>
      <span className={styles['user-controls']}>
        {user.is_admin && (
          <Link
            href={PATHS.ADMIN}
            className='reset'
          >
            <MdAdminPanelSettings
              color='red'
              size={24}
            />
          </Link>
        )}
        <SettingsModal />
      </span>
    </div>
  );
}
