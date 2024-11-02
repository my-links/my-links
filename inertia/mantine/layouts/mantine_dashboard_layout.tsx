import { PropsWithChildren } from 'react';
import BaseLayout from '~/mantine/layouts/_mantine_base_layout';

const LayoutWrapper = ({ children }: PropsWithChildren) => (
	<BaseLayout>{children}</BaseLayout>
);

export { LayoutWrapper as MantineDashboardLayout };
