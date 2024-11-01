import { Container } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { MantineFooter } from '~/components/footer/mantine_footer';
import MantineNavbar from '~/components/navbar/mantine_navbar';
import BaseLayout from '~/mantine/layouts/_mantine_base_layout';

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
