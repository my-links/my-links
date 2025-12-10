import { Link, router } from '@inertiajs/react';
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
import { openSpotlight } from '@mantine/spotlight';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoIosSearch } from 'react-icons/io';
import { IoAdd, IoShieldHalfSharp } from 'react-icons/io5';
import { PiGearLight } from 'react-icons/pi';
import { UserCard } from '~/components/common/user_card';
import { FavoriteList } from '~/components/dashboard/favorite/favorite_list';
import { SearchSpotlight } from '~/components/search/search';
import { useActiveCollection } from '~/hooks/collections/use_active_collection';
import { useAuth } from '~/hooks/use_auth';
import useShortcut from '~/hooks/use_shortcut';
import { useTuyauRequired } from '~/hooks/use_tuyau_required';
import { appendCollectionId } from '~/lib/navigation';
import { useGlobalHotkeysStore } from '~/stores/global_hotkeys_store';

interface DashboardNavbarProps {
	isOpen: boolean;
	toggle: () => void;
}
export function DashboardNavbar({ isOpen, toggle }: DashboardNavbarProps) {
	const { t } = useTranslation('common');
	const { isAuthenticated, user } = useAuth();
	const tuyau = useTuyauRequired();

	const activeCollection = useActiveCollection();
	const { globalHotkeysEnabled, setGlobalHotkeysEnabled } =
		useGlobalHotkeysStore();

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

	useShortcut(
		'OPEN_CREATE_LINK_KEY',
		() =>
			router.visit(
				appendCollectionId(
					tuyau.$route('link.create-form').path,
					activeCollection?.id
				)
			),
		{
			enabled: globalHotkeysEnabled,
		}
	);

	useShortcut(
		'OPEN_CREATE_COLLECTION_KEY',
		() => router.visit(tuyau.$route('collection.create-form').path),
		{
			enabled: globalHotkeysEnabled,
		}
	);

	useShortcut('OPEN_SEARCH_KEY', () => openSpotlight(), {
		enabled: globalHotkeysEnabled,
	});

	const onSpotlightOpen = () => setGlobalHotkeysEnabled(false);
	const onSpotlightClose = () => setGlobalHotkeysEnabled(true);

	return (
		<AppShell.Navbar p="md">
			<Group hiddenFrom="sm" mb="md">
				<Burger opened={isOpen} onClick={toggle} size="sm" />
				<Text>Navigation</Text>
			</Group>
			<UserCard />
			<Divider mt="xs" mb="md" />
			{isAuthenticated && user!.isAdmin && (
				<NavLink
					{...common}
					component={Link}
					href={tuyau.$route('admin.dashboard').path}
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
			<>
				{/* Search button */}
				<NavLink
					{...common}
					label={t('search')}
					leftSection={<IoIosSearch size="1.5rem" />}
					onClick={() => openSpotlight()}
					rightSection={<Kbd size="xs">S</Kbd>}
				/>
				{/* Search spotlight / modal */}
				<SearchSpotlight
					openCallback={onSpotlightOpen}
					closeCallback={onSpotlightClose}
				/>
			</>
			<NavLink
				{...common}
				component={Link}
				href={tuyau.$route('link.create-form').path}
				label={t('link.create')}
				leftSection={<IoAdd size="1.5rem" />}
				rightSection={<Kbd size="xs">C</Kbd>}
			/>
			<NavLink
				{...common}
				component={Link}
				href={tuyau.$route('collection.create-form').path}
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
