import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoAdd, IoShieldHalfSharp } from 'react-icons/io5';
import SearchModal from '~/components/dashboard/search/search_modal';
import FavoriteList from '~/components/dashboard/side_nav/favorite/favorite_list';
import { Item, ItemLink } from '~/components/dashboard/side_nav/nav_item';
import UserCard from '~/components/dashboard/side_nav/user_card';
import ModalSettings from '~/components/settings/settings_modal';
import useUser from '~/hooks/use_user';
import { rgba } from '~/lib/color';
import { appendCollectionId } from '~/lib/navigation';
import { useActiveCollection } from '~/store/collection_store';

const SideMenu = styled.nav(({ theme }) => ({
	height: '100%',
	width: '300px',
	backgroundColor: theme.colors.background,
	borderRight: `1px solid ${theme.colors.lightGrey}`,
	marginRight: '5px',
	display: 'flex',
	gap: '.35em',
	flexDirection: 'column',
}));

const AdminButton = styled(ItemLink)(({ theme }) => ({
	color: theme.colors.lightRed,
	'&:hover': {
		backgroundColor: `${rgba(theme.colors.lightRed, 0.1)}!important`,
	},
}));

const SettingsButton = styled(Item)(({ theme }) => ({
	color: theme.colors.grey,
	'&:hover': {
		backgroundColor: `${rgba(theme.colors.grey, 0.1)}!important`,
	},
}));

const AddButton = styled(ItemLink)(({ theme }) => ({
	color: theme.colors.primary,
	'&:hover': {
		backgroundColor: `${rgba(theme.colors.primary, 0.1)}!important`,
	},
}));

const SearchButton = AddButton.withComponent(Item);

export default function SideNavigation() {
	const { user } = useUser();
	const { t } = useTranslation('common');
	const { activeCollection } = useActiveCollection();
	return (
		<SideMenu>
			<div css={{ paddingInline: '10px' }}>
				<UserCard />
				{user!.isAdmin && (
					<AdminButton href={route('admin.dashboard').url}>
						<IoShieldHalfSharp /> {t('admin')}
					</AdminButton>
				)}
				<ModalSettings openItem={SettingsButton} />
				<SearchModal openItem={SearchButton} />
				<AddButton
					href={appendCollectionId(
						route('link.create-form').url,
						activeCollection?.id
					)}
				>
					<IoAdd /> {t('link.create')}
				</AddButton>
				<AddButton href={route('collection.create-form').url}>
					<AiOutlineFolderAdd /> {t('collection.create')}
				</AddButton>
			</div>
			<FavoriteList />
		</SideMenu>
	);
}
