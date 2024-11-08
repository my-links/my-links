import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import {
	AppShell,
	Burger,
	Divider,
	Group,
	Kbd,
	NavLink,
	rem,
	ScrollArea,
	Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoIosSearch } from 'react-icons/io';
import { IoAdd, IoShieldHalfSharp } from 'react-icons/io5';
import { PiGearLight } from 'react-icons/pi';
import { MantineUserCard } from '~/components/common/user_card';
import { FavoriteList } from '~/components/dashboard/favorite/favorite_list';
import useUser from '~/hooks/use_user';

interface DashboardNavbarProps {
	isOpen: boolean;
	toggle: () => void;
}
export function DashboardNavbar({ isOpen, toggle }: DashboardNavbarProps) {
	const { t } = useTranslation('common');
	const { isAuthenticated, user } = useUser();
	const common = {
		variant: 'subtle',
		color: 'blue',
		active: true,
		styles: {
			label: {
				fontSize: rem(16),
			},
			root: {
				borderRadius: rem(5),
			},
		},
	};
	return (
		<AppShell.Navbar p="md">
			<Group hiddenFrom="sm" mb="md">
				<Burger opened={isOpen} onClick={toggle} size="sm" />
				<Text>Navigation</Text>
			</Group>
			<MantineUserCard />
			<Divider mt="xs" mb="md" />
			{isAuthenticated && user.isAdmin && (
				<NavLink
					{...common}
					component={Link}
					href={route('admin.dashboard').path}
					label={t('admin')}
					leftSection={<IoShieldHalfSharp size="1.5rem" />}
					color="var(--mantine-color-red-5)"
				/>
			)}
			<NavLink
				{...common}
				label={t('settings')}
				leftSection={<PiGearLight size="1.5rem" />}
				color="var(--mantine-color-text)"
				disabled
			/>
			<NavLink
				{...common}
				label={t('search')}
				leftSection={<IoIosSearch size="1.5rem" />}
				disabled
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('link.create-form').path}
				label={t('link.create')}
				leftSection={<IoAdd size="1.5rem" />}
				rightSection={<Kbd size="xs">C</Kbd>}
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('collection.create-form').path}
				label={t('collection.create')}
				leftSection={<AiOutlineFolderAdd size="1.5rem" />}
				rightSection={<Kbd size="xs">L</Kbd>}
			/>
			<AppShell.Section grow component={ScrollArea}>
				<FavoriteList />
			</AppShell.Section>
		</AppShell.Navbar>
	);
}
