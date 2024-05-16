import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import FavoriteList from '~/components/dashboard/side_nav/favorite/favorite_list';
import { Item, ItemLink } from '~/components/dashboard/side_nav/nav_item';
import UserCard from '~/components/dashboard/side_nav/user_card';
import ModalSettings from '~/components/settings/modal';
import useActiveCollection from '~/hooks/use_active_collection';
import { appendCollectionId } from '~/lib/navigation';

const SideMenu = styled.nav({
  height: '100%',
  display: 'flex',
  gap: '.35em',
  flexDirection: 'column',
});

const AdminButton = styled(Item)(({ theme }) => ({
  color: theme.colors.lightRed,
}));

const SettingsButton = styled(Item)(({ theme }) => ({
  color: theme.colors.grey,
}));

const AddButton = styled(ItemLink)(({ theme }) => ({
  color: theme.colors.primary,
}));

export default function SideNavigation() {
  const { activeCollection } = useActiveCollection();
  return (
    <SideMenu>
      <div css={{ paddingInline: '10px' }}>
        <UserCard />
        <AdminButton>
          <MdOutlineAdminPanelSettings /> Administrator
        </AdminButton>
        <ModalSettings openItem={SettingsButton} />
        <AddButton
          href={appendCollectionId(
            route('link.create-form').url,
            activeCollection?.id
          )}
        >
          <IoAdd /> Create link
        </AddButton>
        <AddButton href={route('collection.create-form').url}>
          <AiOutlineFolderAdd /> Create collection
        </AddButton>
      </div>
      <FavoriteList />
    </SideMenu>
  );
}
