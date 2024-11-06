import { Container } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { MantineFooter } from '~/components/footer/footer';
import Navbar from '~/components/navbar/navbar';
import BaseLayout from '~/layouts/_base_layout';

const ContentLayout = ({ children }: PropsWithChildren) => (
	<Container
		style={{
			minHeight: '100%',
			display: 'flex',
			flexDirection: 'column',
		}}
	>
		<Navbar />
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
		<ContentLayout>{children}</ContentLayout>
	</BaseLayout>
);

export { LayoutWrapper as ContentLayout };
