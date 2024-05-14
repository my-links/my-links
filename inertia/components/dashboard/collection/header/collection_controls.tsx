import PATHS from '#constants/paths';
import type Collection from '#models/collection';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';
import { appendCollectionId } from '~/lib/navigation';

const CollectionControls = ({
  collectionId,
}: {
  collectionId: Collection['id'];
}) => (
  <Dropdown label={<BsThreeDotsVertical />} svgSize={18}>
    <DropdownItemLink href={PATHS.LINK.CREATE}>
      <IoIosAddCircleOutline /> Add
    </DropdownItemLink>
    <DropdownItemLink
      href={appendCollectionId(PATHS.COLLECTION.EDIT, collectionId)}
    >
      <GoPencil /> Edit
    </DropdownItemLink>
    <DropdownItemLink
      href={appendCollectionId(PATHS.COLLECTION.REMOVE, collectionId)}
      danger
    >
      <IoTrashOutline /> Delete
    </DropdownItemLink>
  </Dropdown>
);

export default CollectionControls;
