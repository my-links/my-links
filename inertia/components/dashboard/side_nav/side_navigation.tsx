import styled from '@emotion/styled';
import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { AiOutlineFolderAdd } from 'react-icons/ai';
import { IoAdd, IoShieldHalfSharp } from 'react-icons/io5';
import SearchModal from '~/components/dashboard/search/search_modal';
import FavoriteList from '~/components/dashboard/side_nav/favorite/favorite_list';
import { Item, ItemLink } from '~/components/dashboard/side_nav/nav_item';
import UserCard from '~/components/dashboard/side_nav/user_card';
import ModalSettings from '~/components/settings/modal';
import useActiveCollection from '~/hooks/use_active_collection';
import { rgba } from '~/lib/color';
import { appendCollectionId } from '~/lib/navigation';

const SideMenu = styled.nav({
  height: '100%',
  display: 'flex',
  gap: '.35em',
  flexDirection: 'column',
});

const AdminButton = styled(Item)(({ theme }) => ({
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
  const { t } = useTranslation('common');
  const { activeCollection } = useActiveCollection();
  return (
    <SideMenu>
      <div css={{ paddingInline: '10px' }}>
        <UserCard />
        <AdminButton>
          <IoShieldHalfSharp /> {t('admin')}
        </AdminButton>
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
