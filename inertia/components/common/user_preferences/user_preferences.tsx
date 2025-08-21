import { Fieldset, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { CollectionListSelector } from '~/components/dashboard/collection/collection_list_selector';
import { LinkListSelector } from '~/components/dashboard/link/link_list_selector';
import { useIsMobile } from '~/hooks/use_is_mobile';

export function UserPreferences() {
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
				<LinkListSelector />
			</Stack>
		</Fieldset>
	);
}
