import clsx from 'clsx';
import Footer from 'components/Footer/Footer';
import Navbar from 'components/Navbar/Navbar';
import PageTransition from 'components/PageTransition';
import { getServerSideTranslation } from 'i18n';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { AiFillFolderOpen } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import { IoIosLink, IoIosSearch } from 'react-icons/io';
import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import websiteScreenshot from '../../public/website-screenshot.png';

import Quotes from 'components/Quotes/Quotes';
import PATHS from 'constants/paths';
import styles from 'styles/about.module.scss';

export default function AboutPage() {
  const { t } = useTranslation('about');
  return (
    <PageTransition className={clsx('App', styles['about-page'])}>
      <Navbar />
      <HeroHeader />
      <div className={styles['page-content']}>
        <ul className={`reset ${styles['about-list']}`}>
          <AboutItem
            icon={AiFillFolderOpen}
            title={t('about:category.title')}
            text={t('about:category.text')}
          />
          <AboutItem
            icon={IoIosLink}
            title={t('about:link.title')}
            text={t('about:link.text')}
          />
          <AboutItem
            icon={IoIosSearch}
            title={t('about:search.title')}
            text={t('about:search.text')}
          />
          <AboutItem
            icon={IoExtensionPuzzleOutline}
            title={t('about:extension.title')}
            text={t('about:extension.text')}
          />
          <AboutItem
            icon={FaUser}
            title={t('about:contribute.title')}
            text={t('about:contribute.text')}
          />
        </ul>
        <h2>{t('about:look-title')}</h2>
        <div className={styles['screenshot-wrapper']}>
          <Image
            src={websiteScreenshot}
            alt={t('about:website-screenshot-alt')}
            title={t('about:website-screenshot-alt')}
            fill
          />
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
}

const AboutItem = ({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: IconType;
}) => (
  <li className={styles['about-item']}>
    <Icon size={60} />
    <div>{title}</div>
    <p>{text}</p>
  </li>
);

function HeroHeader() {
  const { t } = useTranslation('about');
  return (
    <header className={styles['hero']}>
      <h1>{t('about:hero.title')}</h1>
      <Quotes>{t('common:slogan')}</Quotes>
      <Link
        href={PATHS.APP}
        className='reset'
      >
        {t('about:hero.cta')}
      </Link>
    </header>
  );
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await getServerSideTranslation(locale, ['about'])),
  },
});
