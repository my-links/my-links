import { IoListOutline } from 'react-icons/io5';
import { TbHash } from 'react-icons/tb';
import { ValueWithIcon } from '~/components/common/combo_list/combo_list';
import { usePersisted } from '~/hooks/use_persisted';

const listDisplayOptions: ValueWithIcon[] = [
	{
		label: 'Inline',
		value: 'inline',
		icon: <TbHash size={20} />,
	},
	{
		label: 'List',
		value: 'list',
		icon: <IoListOutline size={20} />,
	},
];
type ListDisplay = (typeof listDisplayOptions)[number]['value'];

export const useCollectionListSelector = () => {
	const [listDisplay, setListDisplay] = usePersisted<ListDisplay>(
		'inline',
		'list'
	);

	return {
		listDisplay,
		listDisplayOptions,
		setListDisplay,
	};
};
