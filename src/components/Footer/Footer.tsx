import PATHS from 'constants/paths';
import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import styles from './footer.module.scss';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className={styles['footer']}>
      <div className='top'>
        <LinkTag href={PATHS.PRIVACY}>{t('common:privacy')}</LinkTag>
        {' • '}
        <LinkTag href={PATHS.TERMS}>{t('common:terms')}</LinkTag>
      </div>
      <div className='bottom'>
        {t('common:footer.made_by')}{' '}
        <LinkTag
          href={PATHS.AUTHOR}
          target='_blank'
        >
          Sonny
        </LinkTag>
        {' • '}
        <LinkTag
          href={PATHS.REPO_GITHUB}
          target='_blank'
        >
          Github
        </LinkTag>
        {' • '}
        <LinkTag
          href={PATHS.EXTENSION}
          target='_blank'
        >
          Extension
        </LinkTag>
      </div>
    </footer>
  );
}
