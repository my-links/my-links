import PATHS from '#constants/paths';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import {
	Box,
	Burger,
	Button,
	Divider,
	Drawer,
	Group,
	Image,
	ScrollArea,
	rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import ExternalLink from '~/components/common/external_link';
import { MantineLanguageSwitcher } from '~/components/common/mantine_language_switcher';
import { MantineThemeSwitcher } from '~/components/common/mantine_theme_switcher';
import classes from './mobile_navbar.module.css';

export default function MantineNavbar() {
	const { t } = useTranslation('common');
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
		useDisclosure(false);

	return (
		<Box pb={40}>
			<header className={classes.header}>
				<Group justify="space-between" h="100%">
					<Image src="/logo-light.png" h={40} alt="MyLinks's logo" />

					<Group h="100%" gap={0} visibleFrom="sm">
						<Link href="/" className={classes.link}>
							{t('home')}
						</Link>
						<ExternalLink href={PATHS.REPO_GITHUB} className={classes.link}>
							Github
						</ExternalLink>
						<ExternalLink href={PATHS.EXTENSION} className={classes.link}>
							Extension
						</ExternalLink>
					</Group>

					<Group gap="xs">
						<MantineThemeSwitcher />
						<MantineLanguageSwitcher />
						<Button
							component={Link}
							href={route('auth.login').url}
							visibleFrom="sm"
							w={110}
						>
							{t('login')}
						</Button>
						<Burger
							opened={drawerOpened}
							onClick={toggleDrawer}
							hiddenFrom="sm"
						/>
					</Group>
				</Group>
			</header>

			<Drawer
				opened={drawerOpened}
				onClose={closeDrawer}
				size="100%"
				padding="md"
				title="Navigation"
				hiddenFrom="sm"
				zIndex={1000000}
			>
				<ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
					<Divider my="sm" />

					<Link href="#" className={classes.link}>
						{t('home')}
					</Link>
					<ExternalLink href={PATHS.REPO_GITHUB} className={classes.link}>
						Github
					</ExternalLink>
					<ExternalLink href={PATHS.EXTENSION} className={classes.link}>
						Extension
					</ExternalLink>

					<Divider my="sm" />

					<Group justify="center" grow pb="xl" px="md">
						<Button component={Link} href={route('auth.login').url}>
							{t('login')}
						</Button>
					</Group>
				</ScrollArea>
			</Drawer>
		</Box>
	);
}