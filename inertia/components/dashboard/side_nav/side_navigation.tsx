import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { BsGear } from 'react-icons/bs';
import { IoAdd } from 'react-icons/io5';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import FavoriteList from '~/components/dashboard/side_nav/favorite/favorite_list';
import { ItemLink } from '~/components/dashboard/side_nav/nav_item';
import UserCard from '~/components/dashboard/side_nav/user_card';

const SideMenu = styled.nav({
  height: '100%',
  display: 'flex',
  gap: '.35em',
  flexDirection: 'column',
});

const AdminButton = styled(ItemLink)(({ theme }) => ({
  color: theme.colors.lightRed,
}));

const SettingsButton = styled(ItemLink)(({ theme }) => ({
  color: theme.colors.grey,
}));

const AddButton = styled(ItemLink)(({ theme }) => ({
  color: theme.colors.primary,
}));

const SideNavigation = () => (
  <SideMenu>
    <div css={{ paddingInline: '10px' }}>
      <UserCard />
      <AdminButton href="/admin">
        <MdOutlineAdminPanelSettings /> Administrator
      </AdminButton>
      <SettingsButton href="/settings">
        <BsGear />
        Settings
      </SettingsButton>
      <AddButton href={PATHS.LINK.CREATE}>
        <IoAdd /> Create link
      </AddButton>
      <AddButton href={PATHS.COLLECTION.CREATE}>
        <AiOutlineFolderAdd /> Create collection
      </AddButton>
    </div>
    <FavoriteList />
  </SideMenu>
);

export default SideNavigation;
