import { useMemo } from 'react';
import { t } from '@lingui/core/macro';

import { useDashboardProps } from '~/hooks/use_dashboard_props';

export function useDashboardPageTitle(): string {
	const { activeCollection, favoriteLinks } = useDashboardProps();

	return useMemo(() => {
		if (activeCollection) {
			const icon = activeCollection.icon ? `${activeCollection.icon} ` : '';
			return `${icon}${activeCollection.name}`;
		}

		if (favoriteLinks?.length) {
			return t`Favorites`;
		}

		return t`Dashboard`;
	}, [activeCollection, favoriteLinks]);
}
