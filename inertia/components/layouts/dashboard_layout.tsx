import styled from '@emotion/styled';
import { ReactNode } from 'react';
import BaseLayout from './_base_layout';

const DashboardLayoutStyle = styled.div(({ theme }) => ({
  height: '100%',
  width: theme.media.small_desktop,
  maxWidth: '100%',
  padding: '0.75em 1em',
}));

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <BaseLayout>
    <DashboardLayoutStyle>{children}</DashboardLayoutStyle>
  </BaseLayout>
);

export default DashboardLayout;
