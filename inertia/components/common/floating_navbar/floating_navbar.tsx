import {
	PROJECT_EXTENSION_URL,
	PROJECT_NAME,
	PROJECT_REPO_GITHUB_URL,
} from '#config/project';
import {
	Box,
	Burger,
	Button,
	Drawer,
	Flex,
	Group,
	Image,
	rem,
	useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';
import { UserDropdown } from '~/components/common/floating_navbar/user_dropdown';
import { ExternalLinkUnstyled } from '~/components/common/links/external_link_unstyled';
import { InternalLink } from '~/components/common/links/internal_link';
import { useAuth } from '~/hooks/use_auth';
import classes from './floating_navbar.module.css';

interface FloatingNavbarProps {
	width: string;
}

export function FloatingNavbar({ width }: FloatingNavbarProps) {
	const auth = useAuth();
	const theme = useMantineTheme();
	const [opened, handler] = useDisclosure(false);
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`, false);

	useEffect(() => {
		if (opened && !isMobile) {
			handler.close();
		}
	}, [isMobile]);

	const links = (
		<>
			<InternalLink route="dashboard" style={{ fontSize: rem(16) }}>
				Dashboard
			</InternalLink>
			<ExternalLinkUnstyled
				href={PROJECT_REPO_GITHUB_URL}
				style={{ fontSize: rem(16) }}
			>
				Github
			</ExternalLinkUnstyled>
			<ExternalLinkUnstyled
				href={PROJECT_EXTENSION_URL}
				style={{ fontSize: rem(16) }}
			>
				Extension
			</ExternalLinkUnstyled>
		</>
	);

	return (
		<>
			<Box className={classes.navbar}>
				<Group className={classes.navbar__content} style={{ width }}>
					<Group>
						<InternalLink style={{ fontSize: rem(24) }} route="home">
							<Image
								src="/logo.png"
								h={35}
								alt="MyLinks's logo"
								referrerPolicy="no-referrer"
							/>
						</InternalLink>
					</Group>
					<Group>
						{!isMobile && <Group>{links}</Group>}
						{isMobile && <Burger opened={opened} onClick={handler.toggle} />}
						{auth.isAuthenticated && <UserDropdown />}
						{!auth.isAuthenticated && (
							<Button
								variant="default"
								component={ExternalLinkUnstyled}
								newTab={false}
								href="/auth/google"
							>
								Log in
							</Button>
						)}
					</Group>
				</Group>

				{/* Mobile drawer */}
				<Drawer
					opened={opened}
					onClose={handler.close}
					padding="md"
					title={PROJECT_NAME}
					zIndex={999999}
					onClick={handler.close}
				>
					<Flex direction="column" gap="md">
						{links}
					</Flex>
				</Drawer>
			</Box>
		</>
	);
}
