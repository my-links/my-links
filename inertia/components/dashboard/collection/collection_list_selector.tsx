import { COLLECTION_LIST_DISPLAYS } from '#shared/lib/display_preferences';
import { CollectionListDisplay } from '#shared/types/index';
import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';

export function CollectionListSelector() {
	const { t } = useTranslation();
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();

	const data = COLLECTION_LIST_DISPLAYS.map((display) => ({
		label: t(`display-preferences.${display}`),
		value: display,
	}));
	return (
		<SegmentedControl
			data={data}
			value={displayPreferences.collectionListDisplay}
			onChange={(value) =>
				handleUpdateDisplayPreferences({
					collectionListDisplay: value as CollectionListDisplay,
				})
			}
			w="50%"
		/>
	);
}
