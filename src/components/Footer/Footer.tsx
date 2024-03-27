import ExternalLink from 'components/ExternalLink';
import PATHS from 'constants/paths';
import { useTranslation } from 'next-i18next';
import LinkTag from 'next/link';
import packageJson from '../../../package.json';
import styles from './footer.module.scss';

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <footer className={styles['footer']}>
      <div className='row'>
        <LinkTag href={PATHS.PRIVACY}>{t('common:privacy')}</LinkTag>
        {' • '}
        <LinkTag href={PATHS.TERMS}>{t('common:terms')}</LinkTag>
        {' • '}
        <ExternalLink href={PATHS.EXTENSION}>Extension</ExternalLink>
      </div>
      <div className='row'>
        {t('common:footer.made_by')}{' '}
        <ExternalLink href={PATHS.AUTHOR}>Sonny</ExternalLink>
        {' • '}
        <span>
          Version:{' '}
          <ExternalLink href={PATHS.REPO_GITHUB}>
            {packageJson.version}
          </ExternalLink>
        </span>
      </div>
    </footer>
  );
}
