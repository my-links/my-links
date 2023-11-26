import PageTransition from 'components/PageTransition';
import { NextSeo } from 'next-seo';
import styles from 'styles/error-page.module.scss';
import NavbarUntranslated from '../components/Navbar/NavbarUntranslated';

export default function Custom404() {
  return (
    <PageTransition
      className={styles['App']}
      hideLangageSelector
    >
      <NextSeo title='Page not found' />
      <NavbarUntranslated />
      <header>
        <h1>404</h1>
        <h2>Page not found</h2>
      </header>
    </PageTransition>
  );
}
