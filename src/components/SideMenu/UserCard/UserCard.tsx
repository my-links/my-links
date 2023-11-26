import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { TFunctionParam } from 'types/i18next';
import styles from './user-card.module.scss';
import SettingsModal from 'components/Settings/SettingsModal';

export default function UserCard() {
  const { data } = useSession({ required: true });
  const { t } = useTranslation();

  const avatarLabel = t('common:avatar', {
    name: data.user.name,
  } as TFunctionParam);
  return (
    <div className={styles['user-card-wrapper']}>
      <div className={styles['user-card']}>
        <Image
          src={data.user.image}
          width={28}
          height={28}
          alt={avatarLabel}
          title={avatarLabel}
        />
        {data.user.name}
      </div>
      <SettingsModal />
    </div>
  );
}
