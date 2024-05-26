import styled from '@emotion/styled';
import { ReactNode } from 'react';
import Footer from '~/components/footer/footer';
import TransitionLayout from '~/components/layouts/_transition_layout';
import Navbar from '~/components/navbar/navbar';
import BaseLayout from './_base_layout';

const ContentLayoutStyle = styled(TransitionLayout)(({ theme }) => ({
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

const ContentLayout = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <BaseLayout>
    <ContentLayoutStyle className={className}>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ContentLayoutStyle>
  </BaseLayout>
);

export default ContentLayout;
