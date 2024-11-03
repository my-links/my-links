import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import {
	AppShell,
	Burger,
	Divider,
	Group,
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
import { MantineUserCard } from '~/components/common/mantine_user_card';
import useUser from '~/hooks/use_user';
import { FavoriteList } from '~/mantine/components/dashboard/favorite/favorite_list';

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
					href={route('admin.dashboard').url}
					label={t('admin')}
					leftSection={<IoShieldHalfSharp size="1.5rem" />}
					color="var(--mantine-color-red-5)"
				/>
			)}
			<NavLink
				{...common}
				label={t('settings')}
				leftSection={<PiGearLight size="1.5rem" />}
				color="var(--mantine-color-gray-7)"
			/>
			<NavLink
				{...common}
				label={t('search')}
				leftSection={<IoIosSearch size="1.5rem" />}
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('link.create-form').url}
				label={t('link.create')}
				leftSection={<IoAdd size="1.5rem" />}
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('collection.create-form').url}
				label={t('collection.create')}
				leftSection={<AiOutlineFolderAdd size="1.5rem" />}
			/>
			<AppShell.Section grow component={ScrollArea}>
				<FavoriteList />
			</AppShell.Section>
		</AppShell.Navbar>
	);
}
