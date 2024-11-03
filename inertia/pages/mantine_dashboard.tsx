import {
	AppShell,
	Burger,
	Group,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import DashboardProviders from '~/components/dashboard/dashboard_provider';
import LinkItem from '~/components/dashboard/link/link_item';
import { MantineFooter } from '~/components/footer/mantine_footer';
import { DashboardNavbar } from '~/mantine/components/dashboard/dashboard_navbar';
import { MantineDashboardLayout } from '~/mantine/layouts/mantine_dashboard_layout';
import { CollectionWithLinks } from '~/types/app';
import '../styles/body_overflow_hidden.css';
import classes from './dashboard.module.css';

interface DashboardPageProps {
	collections: CollectionWithLinks[];
	activeCollection: CollectionWithLinks;
}

export default function MantineDashboard(props: Readonly<DashboardPageProps>) {
	const [openedNavbar, { toggle: toggleNavbar }] = useDisclosure();
	const [openedAside, { toggle: toggleAside }] = useDisclosure();

	return (
		<MantineDashboardLayout>
			<DashboardProviders {...props}>
				<AppShell
					layout="alt"
					header={{ height: 60 }}
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
						aside: classes.ml_bg_color,
						footer: classes.ml_bg_color,
						navbar: classes.ml_bg_color,
						header: classes.ml_bg_color,
					}}
				>
					<AppShell.Header style={{ display: 'flex', alignItems: 'center' }}>
						<Group justify="space-between" px="md" flex={1}>
							<Group h="100%">
								<Burger
									opened={openedNavbar}
									onClick={toggleNavbar}
									hiddenFrom="sm"
									size="sm"
								/>
								{props.activeCollection.name}
							</Group>
							<Burger
								opened={openedAside}
								onClick={toggleAside}
								hiddenFrom="md"
								size="md"
							/>
						</Group>
					</AppShell.Header>
					<DashboardNavbar isOpen={openedNavbar} toggle={toggleNavbar} />
					<AppShell.Main>
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
					</AppShell.Main>
					<AppShell.Aside p="md">
						<Group justify="space-between">
							<Text>Aside</Text>
							<Burger
								opened={openedAside}
								onClick={toggleAside}
								hiddenFrom="md"
								size="md"
							/>
						</Group>
					</AppShell.Aside>
					<AppShell.Footer pl="xs" pr="xs">
						<MantineFooter />
					</AppShell.Footer>
				</AppShell>
			</DashboardProviders>
		</MantineDashboardLayout>
	);
}
