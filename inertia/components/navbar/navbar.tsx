import PATHS from '#core/constants/paths';
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
import { MantineLanguageSwitcher } from '~/components/common/language_switcher';
import { MantineThemeSwitcher } from '~/components/common/theme_switcher';
import useUser from '~/hooks/use_user';
import classes from './mobile.module.css';

export default function Navbar() {
	const { t } = useTranslation('common');
	const { isAuthenticated } = useUser();
	const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
		useDisclosure(false);

	return (
		<Box pb={40}>
			<header className={classes.header}>
				<Group justify="space-between" h="100%">
					<Link href="/">
						<Image src="/logo.png" h={35} alt="MyLinks's logo" />
					</Link>

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
						{!isAuthenticated ? (
							<Button
								component="a"
								href={route('auth').path}
								visibleFrom="sm"
								w={110}
							>
								{t('login')}
							</Button>
						) : (
							<Button
								component={Link}
								href={route('dashboard').path}
								visibleFrom="sm"
								w={110}
							>
								Dashboard
							</Button>
						)}
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
						{!isAuthenticated ? (
							<Button component="a" href={route('auth').path} w={110}>
								{t('login')}
							</Button>
						) : (
							<Button component={Link} href={route('dashboard').path} w={110}>
								Dashboard
							</Button>
						)}
					</Group>
				</ScrollArea>
			</Drawer>
		</Box>
	);
}
