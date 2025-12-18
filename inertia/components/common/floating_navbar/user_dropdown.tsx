import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import cx from 'clsx';
import { Trans } from '@lingui/react/macro';
import { InternalLinkUnstyled } from '~/components/common/links/internal_link_unstyled';
import { useAuth } from '~/hooks/use_auth';
import classes from './user_dropdown.module.css';

export function UserDropdown() {
	const auth = useAuth();
	const [userMenuOpened, { open: openUserMenu, close: closeUserMenu }] =
		useDisclosure(false);

	return (
		<Menu
			width={260}
			position="bottom-end"
			transitionProps={{ transition: 'pop-top-right' }}
			onClose={closeUserMenu}
			onOpen={openUserMenu}
			withinPortal
		>
			<Menu.Target>
				<UnstyledButton
					className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
				>
					<Group gap={7}>
						<Avatar
							src={auth.user?.avatarUrl}
							alt={auth.user?.fullname}
							radius="xl"
							size={20}
							imageProps={{
								referrerPolicy: 'no-referrer',
							}}
						/>
						<Text fw={500} size="sm" lh={1} mr={3}>
							{auth.user?.fullname}
						</Text>
						<div
							className="i-tabler-chevron-down"
							style={{ width: '12px', height: '12px' }}
						/>
					</Group>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				{auth.user?.isAdmin && (
					<>
						<Menu.Label>
							<Trans>Admin</Trans>
						</Menu.Label>
						<Menu.Item
							leftSection={
								<div
									className="i-tabler-shield"
									style={{ width: '16px', height: '16px' }}
								/>
							}
							component={InternalLinkUnstyled}
							href="/admin"
							color="red"
						>
							<Trans>Manage users</Trans>
						</Menu.Item>
					</>
				)}

				<Menu.Label>
					<Trans>User</Trans>
				</Menu.Label>
				<Menu.Item
					leftSection={
						<div
							className="i-tabler-settings"
							style={{ width: '16px', height: '16px' }}
						/>
					}
					component={InternalLinkUnstyled}
					href="/user/settings"
				>
					<Trans>Settings</Trans>
				</Menu.Item>
				<Menu.Item
					leftSection={
						<div
							className="i-tabler-logout"
							style={{ width: '16px', height: '16px' }}
						/>
					}
					component={InternalLinkUnstyled}
					href="/auth/logout"
				>
					<Trans>Logout</Trans>
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
