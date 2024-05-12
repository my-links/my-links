import PATHS from '#constants/paths';
import styled from '@emotion/styled';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';

const DeleteItem = styled(DropdownItemLink)(({ theme }) => ({
  color: theme.colors.lightRed,
}));

const CollectionControls = () => (
  <Dropdown label={<BsThreeDotsVertical />}>
    <DropdownItemLink href={PATHS.LINK.CREATE}>
      <IoIosAddCircleOutline /> Add
    </DropdownItemLink>
    <DropdownItemLink href={PATHS.COLLECTION.EDIT}>
      <HiOutlinePencil /> Edit
    </DropdownItemLink>
    <DeleteItem href={PATHS.COLLECTION.REMOVE}>
      <IoTrashOutline /> Delete
    </DeleteItem>
  </Dropdown>
);

export default CollectionControls;
