import { Box, rem } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { FloatingNavbar } from '~/components/common/floating_navbar/floating_navbar';
import { Footer } from '~/components/common/footer/footer';
import { BaseLayout } from './base_layout';

const SmallContentLayout = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<Layout>{children}</Layout>
	</BaseLayout>
);

export default SmallContentLayout;

const LAYOUT_WIDTH = '1500px';
const CONTENT_WIDTH = '800px';
const Layout = ({ children }: PropsWithChildren) => (
	<>
		{/* Top navbar */}
		<FloatingNavbar width={LAYOUT_WIDTH} />

		{/* Page content */}
		<Box
			style={{
				paddingInline: 'var(--mantine-spacing-lg)',
				flex: 1,
			}}
		>
			<Box
				style={{
					height: '100%',
					maxWidth: '100%',
					width: CONTENT_WIDTH,
					marginInline: 'auto',
					marginBlock: rem(30),
				}}
			>
				{children}
			</Box>
		</Box>

		{/* Footer */}
		<Footer />
	</>
);
