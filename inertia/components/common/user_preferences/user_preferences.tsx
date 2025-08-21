import { LinkListDisplay } from '#shared/types/index';
import { Fieldset, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ComboList } from '~/components/common/combo_list/combo_list';
import { CollectionListSelector } from '~/components/dashboard/collection/collection_list_selector';
import { useDisplayPreferences } from '~/hooks/use_display_preferences';
import { useIsMobile } from '~/hooks/use_is_mobile';
import { getLinkListDisplayOptions } from '~/lib/display_preferences';

export function UserPreferences() {
	const { displayPreferences, handleUpdateDisplayPreferences } =
		useDisplayPreferences();
	const { t } = useTranslation();
	const isMobile = useIsMobile();

	return (
		<Fieldset legend={t('preferences')}>
			{isMobile && (
				<Text size="xs" c="orange" mb="sm">
					{t('preferences-description')}
				</Text>
			)}
			<Stack>
				<Text size="sm" c="dimmed">
					{t('display-preferences.collection-list-display')}
				</Text>
				<CollectionListSelector />
				<Text size="sm" c="dimmed">
					{t('display-preferences.link-list-display')}
				</Text>
				<ComboList
					selectedValue={displayPreferences.linkListDisplay}
					values={getLinkListDisplayOptions()}
					setValue={(value) =>
						handleUpdateDisplayPreferences({
							linkListDisplay: value as LinkListDisplay,
						})
					}
				/>
			</Stack>
		</Fieldset>
	);
}
