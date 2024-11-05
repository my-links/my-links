import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { Link } from '@inertiajs/react';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { IoIosLogOut } from 'react-icons/io';
import Dropdown from '~/components/common/dropdown/dropdown';
import {
	DropdownItemButton,
	DropdownItemLink,
} from '~/components/common/dropdown/dropdown_item';
import ExternalLink from '~/components/common/external_link';
import RoundedImage from '~/components/common/rounded_image';
import UnstyledList from '~/components/common/unstyled/unstyled_list';
import ModalSettings from '~/components/settings/settings_modal';
import useUser from '~/hooks/use_user';

type NavbarListDirection = {
	right?: boolean;
};

const Nav = styled.nav({
	width: '100%',
	padding: '0.75em 0',
	display: 'flex',
	alignItems: 'center',
});

const NavList = styled(UnstyledList)<NavbarListDirection>(
	({ theme, right }) => ({
		display: 'flex',
		flex: 1,
		gap: '1.5em',
		justifyContent: right ? 'flex-end' : 'flex-start',
		transition: theme.transition.delay,

		'& li': {
			display: 'flex',
			alignItems: 'center',
		},
	})
);

const AdminLink = styled(Link)(({ theme }) => ({
	color: theme.colors.lightRed,
}));

const UserCard = styled.div({
	padding: '0.25em 0.5em',
	display: 'flex',
	gap: '0.35em',
	alignItems: 'center',
	justifyContent: 'center',
});

const DropdownItemButtonWithPadding = styled(DropdownItemButton)({
	cursor: 'pointer',
	padding: 0,
});

export default function Navbar() {
	const { t } = useTranslation('common');
	const { isAuthenticated, user } = useUser();

	return (
		<Nav>
			<NavList>
				<li>
					<Link href={route('home').url} css={{ fontSize: '24px' }}>
						MyLinks
					</Link>
				</li>
			</NavList>
			<NavList right>
				<li>
					<ExternalLink href={PATHS.REPO_GITHUB}>GitHub</ExternalLink>
				</li>
				{isAuthenticated && !!user ? (
					<>
						{user.isAdmin && (
							<li>
								<AdminLink href={route('admin.dashboard').url}>
									{t('admin')}
								</AdminLink>
							</li>
						)}
						<li>
							<Link href={route('dashboard').url}>Dashboard</Link>
						</li>
						<li>
							<ProfileDropdown />
						</li>
					</>
				) : (
					<>
						<li>
							<ModalSettings openItem={DropdownItemButtonWithPadding} />
						</li>
						<li>
							<Link href={route('auth').path}>{t('login')}</Link>
						</li>
					</>
				)}
			</NavList>
		</Nav>
	);
}

function ProfileDropdown() {
	const { t } = useTranslation('common');
	const { user } = useUser();

	return (
		<Dropdown
			label={
				<UserCard>
					<RoundedImage
						src={user!.avatarUrl}
						width={22}
						referrerPolicy="no-referrer"
					/>
					{user!.fullname}
				</UserCard>
			}
		>
			<ModalSettings openItem={DropdownItemButton} />
			<DropdownItemLink href={route('auth.logout').url} danger>
				<IoIosLogOut /> {t('logout')}
			</DropdownItemLink>
		</Dropdown>
	);
}
