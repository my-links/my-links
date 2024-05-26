import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import { IoIosLink, IoIosSearch, IoIosShareAlt } from 'react-icons/io';
import { IoExtensionPuzzleOutline } from 'react-icons/io5';
import AboutItem from '~/components/home/about/about_item';
import AboutList from '~/components/home/about/about_list';
import HeroHeader from '~/components/home/hero_header';
import WebsitePreview from '~/components/home/website_preview';
import ContentLayout from '~/components/layouts/content_layout';

const PageContent = styled.div({
  marginBottom: '4em',
  textAlign: 'center',
  display: 'flex',
  gap: '2em',
  flex: 1,
  flexDirection: 'column',
});

function HomePage() {
  const { t } = useTranslation();
  return (
    <>
      <HeroHeader />
      <PageContent>
        <AboutList>
          <AboutItem
            icon={AiFillFolderOpen}
            title={t('about:collection.title')}
            text={t('about:collection.text')}
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
            icon={IoIosShareAlt}
            title={t('about:share.title')}
            text={t('about:share.text')}
          />
          <AboutItem
            icon={FaUser}
            title={t('about:contribute.title')}
            text={t('about:contribute.text')}
          />
        </AboutList>
        <WebsitePreview />
      </PageContent>
    </>
  );
}

HomePage.layout = (page: ReactNode) => <ContentLayout children={page} />;
export default HomePage;
