import styled from '@emotion/styled';
import { ReactNode } from 'react';
import Navbar from '../navbar/navbar';
import BaseLayout from './_base_layout';

const ContentLayoutStyle = styled.div(({ theme }) => ({
  height: 'auto',
  width: theme.media.small_desktop,
  maxWidth: '100%',
  padding: '1em',
}));

const ContentLayout = ({ children }: { children: ReactNode }) => (
  <BaseLayout>
    <ContentLayoutStyle>
      <Navbar />
      <main>{children}</main>
    </ContentLayoutStyle>
  </BaseLayout>
);

export default ContentLayout;
