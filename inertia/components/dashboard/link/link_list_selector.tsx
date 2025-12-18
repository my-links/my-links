import { LINK_LIST_DISPLAYS } from '#shared/lib/display_preferences';
import { LinkListDisplay } from '#shared/types/index';
import { SegmentedControl } from '@mantine/core';
import { Trans as TransComponent } from '@lingui/react';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';

export function LinkListSelector() {
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();

	const data = LINK_LIST_DISPLAYS.map((display) => ({
		label: (
			<TransComponent id={`display-preferences.${display}`} message={display} />
		),
		value: display,
	}));
	return (
		<SegmentedControl
			data={data}
			value={displayPreferences.linkListDisplay}
			onChange={(value) =>
				handleUpdateDisplayPreferences({
					linkListDisplay: value as LinkListDisplay,
				})
			}
			w="50%"
		/>
	);
}
