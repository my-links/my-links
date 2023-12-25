import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import * as Keys from 'constants/keys';
import PATHS from 'constants/paths';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { DefaultSeo } from 'next-seo';
import { useRouter } from 'next/router';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import 'styles/globals.scss';
import 'styles/table.scss';
import config from '../../config';
import nextI18nextConfig from '../../next-i18next.config';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  // TODO: use dynamic locale import
  dayjs.locale(i18n.language);

  useHotkeys(Keys.CLOSE_SEARCH_KEY, () => router.push(PATHS.HOME), {
    enabled: router.pathname !== PATHS.HOME,
    enableOnFormTags: ['INPUT'],
  });

  useEffect(() => {
    // Page loading events
    router.events.on('routeChangeStart', nProgress.start);
    router.events.on('routeChangeComplete', nProgress.done);
    router.events.on('routeChangeError', nProgress.done);

    return () => {
      router.events.off('routeChangeStart', nProgress.start);
      router.events.off('routeChangeComplete', nProgress.done);
      router.events.off('routeChangeError', nProgress.done);
    };
  }, [router.events]);

  return (
    <SessionProvider session={session}>
      <DefaultSeo
        titleTemplate='MyLinks — %s'
        defaultTitle='MyLinks'
        openGraph={{
          type: 'website',
          locale: i18n.language,
          url: config.url,
          siteName: config.name,
          description: config.description,
          images: [
            {
              url: '/logo-light.png',
              width: 500,
              height: 165,
              alt: 'MyLinks logo',
            },
          ],
        }}
        twitter={{
          handle: '@handle',
          site: '@site',
          cardType: 'summary_large_image',
        }}
      />
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp, nextI18nextConfig);
