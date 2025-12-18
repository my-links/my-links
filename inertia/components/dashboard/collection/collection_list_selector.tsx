import { COLLECTION_LIST_DISPLAYS } from '#shared/lib/display_preferences';
import { CollectionListDisplay } from '#shared/types/index';
import { SegmentedControl } from '@mantine/core';
import { Trans as TransComponent } from '@lingui/react';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';

export function CollectionListSelector() {
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();

	const data = COLLECTION_LIST_DISPLAYS.map((display) => ({
		label: (
			<TransComponent id={`display-preferences.${display}`} message={display} />
		),
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
