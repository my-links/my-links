import { AppShell, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import DashboardProviders from '~/components/dashboard/dashboard_provider';
import LinkItem from '~/components/dashboard/link/link_item';
import { MantineFooter } from '~/components/footer/mantine_footer';
import useShortcut from '~/hooks/use_shortcut';
import { DashboardAside } from '~/mantine/components/dashboard/dashboard_aside';
import { DashboardHeader } from '~/mantine/components/dashboard/dashboard_header';
import { DashboardNavbar } from '~/mantine/components/dashboard/dashboard_navbar';
import { NoLink } from '~/mantine/components/dashboard/link/no_link';
import { MantineDashboardLayout } from '~/mantine/layouts/mantine_dashboard_layout';
import { CollectionWithLinks } from '~/types/app';
import classes from './dashboard.module.css';

interface DashboardPageProps {
	collections: CollectionWithLinks[];
	activeCollection: CollectionWithLinks;
}

export default function MantineDashboard(props: Readonly<DashboardPageProps>) {
	const [openedNavbar, { toggle: toggleNavbar, close: closeNavbar }] =
		useDisclosure();
	const [openedAside, { toggle: toggleAside, close: closeAside }] =
		useDisclosure();

	useShortcut('ESCAPE_KEY', () => {
		closeNavbar();
		closeAside();
	});

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, []);

	return (
		<MantineDashboardLayout>
			<DashboardProviders {...props}>
				<div className={classes.app_wrapper}>
					<AppShell
						layout="alt"
						header={{ height: 50 }}
						navbar={{
							width: 300,
							breakpoint: 'sm',
							collapsed: { mobile: !openedNavbar },
						}}
						aside={{
							width: 300,
							breakpoint: 'md',
							collapsed: { mobile: !openedAside },
						}}
						classNames={{
							aside: classes.ml_custom_class,
							footer: classes.ml_custom_class,
							navbar: classes.ml_custom_class,
							header: classes.ml_custom_class,
						}}
						className={classes.app_shell}
					>
						<DashboardHeader
							navbar={{ opened: openedNavbar, toggle: toggleNavbar }}
							aside={{ opened: openedAside, toggle: toggleAside }}
						/>
						<DashboardNavbar isOpen={openedNavbar} toggle={toggleNavbar} />
						<AppShell.Main>
							{props.activeCollection.links.length > 0 ? (
								<ScrollArea
									h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"
									p="md"
								>
									<Stack gap="xs">
										{props.activeCollection.links.map((link) => (
											<LinkItem key={link.id} link={link} showUserControls />
										))}
									</Stack>
								</ScrollArea>
							) : (
								<NoLink key={props.activeCollection.id} />
							)}
						</AppShell.Main>
						<DashboardAside isOpen={openedAside} toggle={toggleAside} />
						<AppShell.Footer pl="xs" pr="xs">
							<MantineFooter />
						</AppShell.Footer>
					</AppShell>
				</div>
			</DashboardProviders>
		</MantineDashboardLayout>
	);
}
