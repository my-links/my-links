import clsx from 'clsx';
import Navbar from 'components/Navbar/Navbar';
import PageTransition from 'components/PageTransition';
import PATHS from 'constants/paths';
import { getServerSideTranslation } from 'i18n';
import { Trans, useTranslation } from 'next-i18next';
import { DefaultSeo } from 'next-seo';
import LinkTag from 'next/link';
import styles from 'styles/legal-pages.module.scss';

export default function Terms() {
  const { t } = useTranslation('terms');
  return (
    <PageTransition className={clsx('App', styles['legal'])}>
      <DefaultSeo title='Terms of use' />
      <Navbar />
      <main>
        <h1>{t('terms:title')}</h1>
        <p>{t('terms:edited_at', { date: '19/11/2023' })}</p>
        <p>{t('terms:welcome')}</p>

        <h2>{t('terms:accept.title')}</h2>
        <p>{t('terms:accept.description')}</p>

        <h2>{t('terms:use.title')}</h2>
        <h3>{t('terms:use.account.title')}</h3>
        <p>{t('terms:use.account.description')}</p>

        <h3>{t('terms:use.allowed.title')}</h3>
        <p>{t('terms:use.allowed.description')}</p>

        <h3>{t('terms:use.user_content.title')}</h3>
        <p>{t('terms:use.user_content.description')}</p>

        <h2>{t('terms:personal_data.title')}</h2>
        <h3>{t('terms:personal_data.collect.title')}</h3>
        <p>
          <Trans
            i18nKey='terms:personal_data.collect.description'
            components={{ a: <LinkTag href={PATHS.PRIVACY} /> }}
          />
        </p>

        <h3>{t('terms:personal_data.suppress.title')}</h3>
        <p>{t('terms:personal_data.suppress.description')}</p>

        <h2>{t('terms:responsibility_warranty.title')}</h2>
        <h3>{t('terms:responsibility_warranty.responsibility.title')}</h3>
        <p>{t('terms:responsibility_warranty.responsibility.description')}</p>

        <h3>{t('terms:responsibility_warranty.warranty.title')}</h3>
        <p>{t('terms:responsibility_warranty.warranty.description')}</p>

        <h2>{t('terms:terms_changes.title')}</h2>
        <p>{t('terms:terms_changes.description')}</p>

        <h2>{t('terms:cancel.title')}</h2>
        <p>{t('terms:cancel.description')}</p>

        <h2>{t('terms:contact.title')}</h2>
        <p>
          {t('terms:contact.description')}{' '}
          <LinkTag
            href='mailto:sonnyasdev@gmail.com'
            target='_blank'
          >
            sonnyasdev[at]gmail[dot]com
          </LinkTag>
        </p>

        <p>{t('terms:footer.changes')}</p>
        <p>{t('terms:footer.thanks')}</p>
      </main>
    </PageTransition>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getServerSideTranslation(locale, ['terms'])),
    },
  };
}
