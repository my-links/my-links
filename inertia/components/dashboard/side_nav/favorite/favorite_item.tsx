import styled from '@emotion/styled';
import { ItemLink } from '~/components/dashboard/side_nav/nav_item';

const FavoriteItem = styled(ItemLink)(({ theme }) => ({
  backgroundColor: theme.colors.white,
}));

export default FavoriteItem;
