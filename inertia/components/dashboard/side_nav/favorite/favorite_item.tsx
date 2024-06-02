import styled from '@emotion/styled';
import { ItemExternalLink } from '~/components/dashboard/side_nav/nav_item';

const FavoriteItem = styled(ItemExternalLink)(({ theme }) => ({
  backgroundColor: theme.colors.secondary,
}));

export default FavoriteItem;
