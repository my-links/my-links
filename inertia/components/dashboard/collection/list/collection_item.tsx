import styled from '@emotion/styled';
import { Item } from '~/components/dashboard/side_nav/nav_item';

const CollectionItem = styled(Item)(({ theme }) => ({
  backgroundColor: theme.colors.secondary,
}));

export default CollectionItem;
