import { PropsWithChildren } from 'react';
import BaseLayout from '~/layouts/_base_layout';

const LayoutWrapper = ({ children }: PropsWithChildren) => (
	<BaseLayout>{children}</BaseLayout>
);

export { LayoutWrapper as DashboardLayout };
