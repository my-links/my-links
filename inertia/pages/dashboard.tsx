import { AppShell, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import { DashboardAside } from '~/components/dashboard/dashboard_aside';
import { DashboardHeader } from '~/components/dashboard/dashboard_header';
import { DashboardNavbar } from '~/components/dashboard/dashboard_navbar';
import { LinkList } from '~/components/dashboard/link/list/link_list';
import { MantineFooter } from '~/components/footer/footer';
import { useDisableOverflow } from '~/hooks/use_disable_overflow';
import useShortcut from '~/hooks/use_shortcut';
import { DashboardLayout } from '~/layouts/dashboard_layout';
import {
	useActiveCollection,
	useCollectionsSetter,
} from '~/stores/collection_store';
import { CollectionWithLinks } from '~/types/app';
import classes from './dashboard.module.css';

interface DashboardPageProps {
	collections: CollectionWithLinks[];
	activeCollection: CollectionWithLinks;
}

const HEADER_SIZE_WITH_DESCRIPTION = 60;
const HEADER_SIZE_WITHOUT_DESCRIPTION = 50;

export default function MantineDashboard(props: Readonly<DashboardPageProps>) {
	const [openedNavbar, { toggle: toggleNavbar, close: closeNavbar }] =
		useDisclosure();
	const [openedAside, { toggle: toggleAside, close: closeAside }] =
		useDisclosure();

	const { activeCollection } = useActiveCollection();
	const { _setCollections, setActiveCollection } = useCollectionsSetter();

	useShortcut('ESCAPE_KEY', () => {
		closeNavbar();
		closeAside();
	});

	useDisableOverflow();

	useEffect(() => {
		_setCollections(props.collections);
		setActiveCollection(props.activeCollection);
	}, []);

	const headerHeight = !!activeCollection?.description
		? HEADER_SIZE_WITH_DESCRIPTION
		: HEADER_SIZE_WITHOUT_DESCRIPTION;
	const footerHeight = 45;
	return (
		<DashboardLayout>
			<div className={classes.app_wrapper}>
				<AppShell
					layout="alt"
					header={{ height: headerHeight }}
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
					footer={{ height: footerHeight }}
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
						<ScrollArea
							h="calc(100vh - var(--app-shell-header-height) - var(--app-shell-footer-height, 0px))"
							p="md"
						>
							<LinkList />
						</ScrollArea>
					</AppShell.Main>
					<DashboardAside isOpen={openedAside} toggle={toggleAside} />
					<AppShell.Footer pl="xs" pr="xs">
						<MantineFooter />
					</AppShell.Footer>
				</AppShell>
			</div>
		</DashboardLayout>
	);
}
