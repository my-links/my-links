import { Trans } from '@lingui/react/macro';

import { LinkList } from '~/components/common/link_list';
import { useDashboardProps } from '~/hooks/use_dashboard_props';

export function FavoritesViewContent() {
	const { favoriteLinks } = useDashboardProps();

	return (
		<LinkList
			links={favoriteLinks}
			layoutStoreKey="dashboard"
			emptyStateHint={<Trans>Create your first link to get started</Trans>}
		/>
	);
}
