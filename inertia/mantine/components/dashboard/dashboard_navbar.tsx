import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import {
	AppShell,
	Burger,
	Divider,
	Group,
	NavLink,
	ScrollArea,
	Skeleton,
	Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoIosSearch } from 'react-icons/io';
import { IoAdd, IoShieldHalfSharp } from 'react-icons/io5';
import { PiGearLight } from 'react-icons/pi';
import { MantineUserCard } from '~/components/common/mantine_user_card';
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
	};
	return (
		<AppShell.Navbar p="md">
			<Group hiddenFrom="sm" mb="md">
				<Burger opened={isOpen} onClick={toggle} size="sm" />
				<Text>Menu</Text>
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
				label={t('settings')}
				leftSection={<PiGearLight size="1.5rem" />}
				variant="subtle"
			/>
			<NavLink
				{...common}
				label={t('search')}
				leftSection={<IoIosSearch size="1.5rem" />}
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('collection.create-form').url}
				label={t('collection.create')}
				leftSection={<IoAdd size="1.5rem" />}
			/>
			<NavLink
				{...common}
				component={Link}
				href={route('link.create-form').url}
				label={t('link.create')}
				leftSection={<AiOutlineFolderAdd size="1.5rem" />}
			/>
			<Text size="sm" fw={500} c="dimmed" mt="sm" ml="md">
				{t('favorite')} • {0}
			</Text>
			<AppShell.Section grow component={ScrollArea}>
				{Array(15)
					.fill(0)
					.map((_, index) => (
						<Skeleton key={index} h={28} mt="sm" animate={false} />
					))}
			</AppShell.Section>
		</AppShell.Navbar>
	);
}
