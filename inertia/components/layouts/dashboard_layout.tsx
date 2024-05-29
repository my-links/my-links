import styled from '@emotion/styled';
import { ReactNode } from 'react';
import TransitionLayout from '~/components/layouts/_transition_layout';
import BaseLayout from './_base_layout';

const DashboardLayoutStyle = styled(TransitionLayout)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  width: theme.media.medium_desktop,
  maxWidth: '100%',
  padding: '0.75em 1em',
  overflow: 'hidden',
}));

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <BaseLayout>
    <DashboardLayoutStyle>{children}</DashboardLayoutStyle>
  </BaseLayout>
);

export default DashboardLayout;
