import PATHS from '#constants/paths';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { HiOutlinePencil } from 'react-icons/hi2';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';

const CollectionControls = () => (
  <Dropdown label={<BsThreeDotsVertical />} svgSize={18}>
    <DropdownItemLink href={PATHS.LINK.CREATE}>
      <IoIosAddCircleOutline /> Add
    </DropdownItemLink>
    <DropdownItemLink href={PATHS.COLLECTION.EDIT}>
      <HiOutlinePencil /> Edit
    </DropdownItemLink>
    <DropdownItemLink href={PATHS.COLLECTION.REMOVE} danger>
      <IoTrashOutline /> Delete
    </DropdownItemLink>
  </Dropdown>
);

export default CollectionControls;
