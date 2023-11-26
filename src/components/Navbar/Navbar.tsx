import LinkTag from 'next/link';
import { useSession } from 'next-auth/react';
import PATHS from 'constants/paths';
import styles from './navbar.module.scss';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { TFunctionParam } from 'types/i18next';

export default function Navbar() {
  const { data, status } = useSession();
  const { t } = useTranslation();

  const avatarLabel = t('common:avatar', {
    name: data?.user?.name,
  } as TFunctionParam);
  return (
    <nav className={styles['navbar']}>
      <ul className='reset'>
        <li>
          <LinkTag href={PATHS.HOME}>MyLinks</LinkTag>
        </li>
        <li>
          <LinkTag href={PATHS.PRIVACY}>{t('common:privacy')}</LinkTag>
        </li>
        <li>
          <LinkTag href={PATHS.TERMS}>{t('common:terms')}</LinkTag>
        </li>
        {status === 'authenticated' ? (
          <>
            <li className={styles['user']}>
              <Image
                src={data.user.image}
                width={24}
                height={24}
                alt={avatarLabel}
                title={avatarLabel}
              />
              {data.user.name}
            </li>
            <li>
              <LinkTag href={PATHS.LOGOUT}>{t('common:logout')}</LinkTag>
            </li>
          </>
        ) : (
          <li>
            <LinkTag href={PATHS.LOGIN}>{t('common:login')}</LinkTag>
          </li>
        )}
      </ul>
    </nav>
  );
}
