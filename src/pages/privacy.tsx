import LinkTag from 'next/link';
import PageTransition from 'components/PageTransition';
import styles from 'styles/legal-pages.module.scss';
import clsx from 'clsx';
import Navbar from 'components/Navbar/Navbar';
import { getServerSideTranslation } from '../i18n';
import { useTranslation } from 'next-i18next';
import { TFunctionParam } from 'types/i18next';

export default function Privacy() {
  const { t } = useTranslation('privacy');

  return (
    <PageTransition className={clsx('App', styles['legal'])}>
      <Navbar />
      <main>
        <h1>{t('privacy:title')}</h1>
        <p>
          {t('privacy:edited_at', { date: '19/11/2023' } as TFunctionParam)}
        </p>
        <p>{t('privacy:welcome')}</p>

        <h2>{t('privacy:collect.title')}</h2>
        <h3>{t('privacy:collect.cookie.title')}</h3>
        <p>{t('privacy:collect.cookie.description')}</p>

        <h3>{t('privacy:collect.user.title')}</h3>
        <p>{t('privacy:collect.user.description')}</p>
        <ul>
          {(
            t('privacy:collect.user.fields', {
              returnObjects: true,
            } as TFunctionParam) as Array<string>
          ).map((field) => (
            <li key={field}>{field}</li>
          ))}
        </ul>

        <h2>{t('privacy:data_use.title')}</h2>
        <p>{t('privacy:data_use.description')}</p>

        <h2>{t('privacy:data_storage.title')}</h2>
        <p>{t('privacy:data_storage.description')}</p>

        <h3>{t('privacy:data_storage.data_retention.title')}</h3>
        <p>{t('privacy:data_storage.data_retention.description')}</p>

        <h2>{t('privacy:user_rights.title')}</h2>
        <p>{t('privacy:user_rights.description')}</p>

        <h2>{t('privacy:gdpr.title')}</h2>
        <p>{t('privacy:gdpr.description')}</p>

        <h2>{t('privacy:contact.title')}</h2>
        <p>
          {t('privacy:contact.description')}{' '}
          <LinkTag
            href='mailto:sonnyasdev@gmail.com'
            target='_blank'
          >
            sonnyasdev[at]gmail[dot]com
          </LinkTag>
        </p>

        <p>{t('privacy:footer.changes')}</p>
        <p>{t('privacy:footer.thanks')}</p>
      </main>
    </PageTransition>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getServerSideTranslation(locale, ['privacy'])),
    },
  };
}
