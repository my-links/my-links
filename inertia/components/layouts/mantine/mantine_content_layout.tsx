import { Container } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { MantineFooter } from '~/components/footer/mantine_footer';
import BaseLayout from '~/components/layouts/mantine/_mantine_base_layout';
import MantineNavbar from '~/components/navbar/mantine_navbar';

const MantineContentLayout = ({ children }: PropsWithChildren) => (
	<Container
		style={{
			minHeight: '100%',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		<MantineNavbar />
		<main
			style={{
				flex: 1,
			}}
		>
			{children}
		</main>
		<MantineFooter />
	</Container>
);

const LayoutWrapper = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<MantineContentLayout>{children}</MantineContentLayout>
	</BaseLayout>
);

export { LayoutWrapper as MantineContentLayout };
