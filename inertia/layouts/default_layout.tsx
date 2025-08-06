import { Box, rem } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { FloatingNavbar } from '~/components/common/floating_navbar/floating_navbar';
import { Footer } from '~/components/common/footer/footer';
import { BaseLayout } from './_base_layout';

const DefaultLayout = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<Layout>{children}</Layout>
	</BaseLayout>
);

export default DefaultLayout;

const LAYOUT_WIDTH = '1500px';
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
					width: LAYOUT_WIDTH,
					marginInline: 'auto',
					marginBlock: rem(60),
				}}
			>
				{children}
			</Box>
		</Box>

		{/* Footer */}
		<Footer />
	</>
);
