import { Fieldset, Stack, Text } from '@mantine/core';
import { Trans } from '@lingui/react/macro';
import { Trans as TransComponent } from '@lingui/react';
import { CollectionListSelector } from '~/components/dashboard/collection/collection_list_selector';
import { LinkListSelector } from '~/components/dashboard/link/link_list_selector';
import { useIsMobile } from '~/hooks/use_is_mobile';

export function UserPreferences() {
	const isMobile = useIsMobile();

	return (
		<Fieldset
			legend={<TransComponent id="preferences" message="Preferences" />}
		>
			{isMobile && (
				<Text size="xs" c="orange" mb="sm">
					<Trans>Preferences description</Trans>
				</Text>
			)}
			<Stack>
				<Text size="sm" c="dimmed">
					<Trans>Collection list display</Trans>
				</Text>
				<CollectionListSelector />
				<Text size="sm" c="dimmed">
					<Trans>Link list display</Trans>
				</Text>
				<LinkListSelector />
			</Stack>
		</Fieldset>
	);
}
