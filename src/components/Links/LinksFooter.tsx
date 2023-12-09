import PATHS from 'constants/paths';
import LinkTag from 'next/link';
import { useTranslation } from 'react-i18next';
import styles from './links.module.scss';

export default function LinksFooter() {
  const { t } = useTranslation('home');

  return (
    <footer className={styles['footer']}>
      <div className='top'>
        <LinkTag href={PATHS.PRIVACY}>{t('common:privacy')}</LinkTag>
        {' • '}
        <LinkTag href={PATHS.TERMS}>{t('common:terms')}</LinkTag>
      </div>
      <div className='bottom'>
        {t('home:footer.made_by')}{' '}
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
