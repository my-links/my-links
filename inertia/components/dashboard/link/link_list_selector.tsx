import { LINK_LIST_DISPLAYS } from '#shared/lib/display_preferences';
import { LinkListDisplay } from '#shared/types/index';
import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';

export function LinkListSelector() {
	const { t } = useTranslation();
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();

	const data = LINK_LIST_DISPLAYS.map((display) => ({
		label: t(`display-preferences.${display}`),
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
