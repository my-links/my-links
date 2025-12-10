import { PropsWithChildren } from 'react';
import { BaseLayout } from '~/layouts/base_layout';

const LayoutWrapper = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<div data-page-transition>{children}</div>
	</BaseLayout>
);

export { LayoutWrapper as DashboardLayout };
