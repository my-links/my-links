import type Collection from '#models/collection';
import { route } from '@izzyjs/route/client';
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
    <DropdownItemLink href={route('link.create-form').url}>
      <IoIosAddCircleOutline /> Add
    </DropdownItemLink>
    <DropdownItemLink
      href={appendCollectionId(route('collection.edit-form').url, collectionId)}
    >
      <GoPencil /> Edit
    </DropdownItemLink>
    <DropdownItemLink
      href={appendCollectionId(
        route('collection.delete-form').url,
        collectionId
      )}
      danger
    >
      <IoTrashOutline /> Delete
    </DropdownItemLink>
  </Dropdown>
);

export default CollectionControls;
