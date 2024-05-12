import styled from '@emotion/styled';
import { ReactNode } from 'react';
import Footer from '~/components/footer/footer';
import Navbar from '../navbar/navbar';
import BaseLayout from './_base_layout';

const ContentLayoutStyle = styled.div(({ theme }) => ({
  height: '100%',
  width: theme.media.small_desktop,
  maxWidth: '100%',
  padding: '1em',
  display: 'flex',
  flexDirection: 'column',

  '& main': {
    flex: 1,
  },
}));

const ContentLayout = ({ children }: { children: ReactNode }) => (
  <BaseLayout>
    <ContentLayoutStyle>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ContentLayoutStyle>
  </BaseLayout>
);

export default ContentLayout;
