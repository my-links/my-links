import { Container } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { MantineFooter } from '~/components/footer/mantine_footer';
import BaseLayout from '~/components/layouts/mantine/_mantine_base_layout';
import MantineNavbar from '~/components/navbar/mantine_navbar';

function MantineContentLayout({ children }: PropsWithChildren) {
	return (
		<div
			style={{
				minHeight: '100%',
				width: '100%',
				backgroundColor: 'rgb(34, 40, 49)',
			}}
		>
			<Container>
				<MantineNavbar />
				<main>{children}</main>
				<MantineFooter />
			</Container>
		</div>
	);
}

const LayoutWrapper = ({ children }: PropsWithChildren) => (
	<BaseLayout>
		<MantineContentLayout>{children}</MantineContentLayout>
	</BaseLayout>
);

export { LayoutWrapper as MantineContentLayout };
