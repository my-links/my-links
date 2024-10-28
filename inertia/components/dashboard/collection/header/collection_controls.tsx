import { useTranslation } from 'react-i18next';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { GoPencil } from 'react-icons/go';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { IoTrashOutline } from 'react-icons/io5';
import Dropdown from '~/components/common/dropdown/dropdown';
import { DropdownItemLink } from '~/components/common/dropdown/dropdown_item';
import { getPath, routeWithCollectionId } from '~/lib/navigation';
import { Collection } from '~/types/app';

export default function CollectionControls({
	collectionId,
}: {
	collectionId: Collection['id'];
}) {
	const { t } = useTranslation('common');
	return (
		<Dropdown label={<BsThreeDotsVertical />} svgSize={18}>
			<DropdownItemLink href={getPath('link.create-form')}>
				<IoIosAddCircleOutline /> {t('link.create')}
			</DropdownItemLink>
			<DropdownItemLink
				href={routeWithCollectionId('collection.edit-form', collectionId)}
			>
				<GoPencil /> {t('collection.edit')}
			</DropdownItemLink>
			<DropdownItemLink
				href={routeWithCollectionId('collection.delete-form', collectionId)}
				danger
			>
				<IoTrashOutline /> {t('collection.delete')}
			</DropdownItemLink>
		</Dropdown>
	);
}
