import { Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import cx from 'clsx';
import { useTranslation } from 'react-i18next';
import { TbChevronDown, TbLogout, TbUser } from 'react-icons/tb';
import { InternalLink } from '~/components/common/links/internal_link';
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
						/>
						<Text fw={500} size="sm" lh={1} mr={3}>
							{auth.user?.fullname}
						</Text>
						<TbChevronDown size={12} />
					</Group>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>{t('common:user')}</Menu.Label>
				<Menu.Item
					leftSection={<TbUser size={16} />}
					component={InternalLinkUnstyled}
					href={`/user/${auth.user?.fullname}`}
					color="inherit"
				>
					{t('common:profile')}
				</Menu.Item>

				{auth.user?.isAdmin && (
					<>
						<Menu.Label>{t('common:admin')}</Menu.Label>
						<InternalLink href="/admin">{t('common:admin')}</InternalLink>
					</>
				)}

				<Menu.Label>{t('common:settings')}</Menu.Label>
				<Menu.Item
					leftSection={<TbLogout size={16} />}
					component={InternalLinkUnstyled}
					href="/auth/logout"
					color="inherit"
				>
					{t('common:logout')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
