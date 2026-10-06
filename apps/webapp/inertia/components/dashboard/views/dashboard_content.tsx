import { Trans } from '@lingui/react/macro';

import { useDashboardProps } from '~/hooks/use_dashboard_props';
import { FavoritesViewContent } from '~/components/dashboard/views/favorites_view_content';
import { CollectionViewContent } from '~/components/dashboard/views/collection_view_content';

export function DashboardContent() {
	const { activeCollection } = useDashboardProps();

	// Both controllers always send `activeCollection` (object or `null`); only an unset prop should hit the placeholder.
	const hasActiveContent = activeCollection !== undefined;

	if (!hasActiveContent) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<div className="i-ant-design-folder-outlined w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
				<p className="text-gray-500 dark:text-gray-400 mb-2">
					<Trans>Select a collection to view its links</Trans>
				</p>
				<p className="text-sm text-gray-400 dark:text-gray-500">
					<Trans>Or create a new collection to get started</Trans>
				</p>
			</div>
		);
	}

	return activeCollection ? (
		<CollectionViewContent />
	) : (
		<FavoritesViewContent />
	);
}
