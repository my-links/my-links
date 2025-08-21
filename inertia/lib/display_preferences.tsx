import {
	COLLECTION_LIST_DISPLAYS,
	LINK_LIST_DISPLAYS,
} from '#shared/lib/display_preferences';
import { AiOutlineFolder } from 'react-icons/ai';
import { IoGridOutline } from 'react-icons/io5';
import { TbList } from 'react-icons/tb';
import { ValueWithIcon } from '~/components/common/combo_list/combo_list';

const collectionListDisplayIcons = {
	list: <TbList size={20} />,
	inline: <AiOutlineFolder size={20} />,
} as const;

export function getCollectionListDisplayOptions(): ValueWithIcon[] {
	return COLLECTION_LIST_DISPLAYS.map((display) => ({
		label: display,
		value: display,
		icon: collectionListDisplayIcons[display],
	}));
}

const linkListDisplayIcons = {
	list: <TbList size={20} />,
	grid: <IoGridOutline size={20} />,
} as const;

export function getLinkListDisplayOptions(): ValueWithIcon[] {
	return LINK_LIST_DISPLAYS.map((display) => ({
		label: display,
		value: display,
		icon: linkListDisplayIcons[display],
	}));
}
