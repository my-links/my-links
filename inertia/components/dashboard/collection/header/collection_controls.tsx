import { route } from '@izzyjs/route/client';
import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';
import { appendCollectionId } from '~/lib/navigation';
import { Collection } from '~/types/app';

export default function CollectionControls({
  collectionId,
}: {
  collectionId: Collection['id'];
}) {
  const { t } = useTranslation('common');
  return (
    <Dropdown label={<BsThreeDotsVertical />} svgSize={18}>
      <DropdownItemLink href={route('link.create-form').url}>
        <IoIosAddCircleOutline /> {t('link.create')}
      </DropdownItemLink>
      <DropdownItemLink
        href={appendCollectionId(
          route('collection.edit-form').url,
          collectionId
        )}
      >
        <GoPencil /> {t('collection.edit')}
      </DropdownItemLink>
      <DropdownItemLink
        href={appendCollectionId(
          route('collection.delete-form').url,
          collectionId
        )}
        danger
      >
        <IoTrashOutline /> {t('collection.delete')}
      </DropdownItemLink>
    </Dropdown>
  );
}
