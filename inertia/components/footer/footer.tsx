import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';
import packageJson from '../../../package.json';

const FooterStyle = styled.footer(({ theme }) => ({
  fontSize: '0.9em',
  color: theme.colors.grey,
  textAlign: 'center',
  paddingTop: '0.75em',
  '& a:hover': {
    textDecoration: 'underline',
  },
}));

export default function Footer() {
  const { t } = useTranslation('common');

  return (
    <FooterStyle>
      <div className="row">
        <Link href={PATHS.PRIVACY}>{t('privacy')}</Link>
        {' • '}
        <Link href={PATHS.TERMS}>{t('terms')}</Link>
        {' • '}
        <ExternalLink href={PATHS.EXTENSION}>Extension</ExternalLink>
      </div>
      <div className="row">
        {t('footer.made_by')}{' '}
        <ExternalLink href={PATHS.AUTHOR}>Sonny</ExternalLink>
        {' • '}
        <span>
          Version:{' '}
          <ExternalLink href={PATHS.REPO_GITHUB}>
            {packageJson.version}
          </ExternalLink>
        </span>
      </div>
    </FooterStyle>
  );
}
