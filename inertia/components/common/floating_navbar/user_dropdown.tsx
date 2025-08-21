import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TbChevronDown, TbLogout, TbSettings, TbShield } from 'react-icons/tb';
import { InternalLinkUnstyled } from '~/components/common/links/internal_link_unstyled';
import { useAuth } from '~/hooks/use_auth';
import classes from './user_dropdown.module.css';

export function UserDropdown() {
	const auth = useAuth();
	const [userMenuOpened, { open: openUserMenu, close: closeUserMenu }] =
		useDisclosure(false);
	const { t } = useTranslation();

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
						<TbChevronDown size={12} />
					</Group>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				{auth.user?.isAdmin && (
					<>
						<Menu.Label>{t('common:admin')}</Menu.Label>
						<Menu.Item
							leftSection={<TbShield size={16} />}
							component={InternalLinkUnstyled}
							href="/admin"
							color="red"
						>
							{t('common:manage-users')}
						</Menu.Item>
					</>
				)}

				<Menu.Label>{t('common:user')}</Menu.Label>
				<Menu.Item
					leftSection={<TbSettings size={16} />}
					component={InternalLinkUnstyled}
					href="/user/settings"
				>
					{t('common:settings')}
				</Menu.Item>
				<Menu.Item
					leftSection={<TbLogout size={16} />}
					component={InternalLinkUnstyled}
					href="/auth/logout"
				>
					{t('common:logout')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
