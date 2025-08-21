import { CollectionListDisplay } from '#shared/types/index';
import { ComboList } from '~/components/common/combo_list/combo_list';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';
import { getCollectionListDisplayOptions } from '~/lib/display_preferences';

export function CollectionListSelector() {
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();
	return (
		<ComboList
			selectedValue={displayPreferences.collectionListDisplay}
			values={getCollectionListDisplayOptions()}
			setValue={(value) =>
				handleUpdateDisplayPreferences({
					collectionListDisplay: value as CollectionListDisplay,
				})
			}
		/>
	);
}
