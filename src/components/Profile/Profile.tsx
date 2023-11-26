import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { TFunctionParam } from 'types/i18next';
import RoundedImage from '../RoundedImage/RoundedImage';
import styles from './profile.module.scss';
import clsx from 'clsx';

export default function Profile() {
  const { data } = useSession();
  const { t } = useTranslation('common');

  const avatarLabel = t('common:avatar', {
    name: data?.user?.name,
  } as TFunctionParam);

  return (
    <ul className={clsx('reset', styles['profile'])}>
      <li
        className={styles['avatar']}
        style={{ textAlign: 'center' }}
      >
        <RoundedImage
          src={data.user.image}
          width={96}
          height={96}
          alt={avatarLabel}
          title={avatarLabel}
        />
      </li>
      <li className={styles['name']}>
        <b>{t('common:name')}</b> {data.user.name}
      </li>
      <li className={styles['email']}>
        <b>{t('common:email')}</b> {data.user.email}
      </li>
    </ul>
  );
}
