import { Trans } from '@lingui/react/macro';

export const UsersTableEmptyState = () => (
	<div className="flex flex-col items-center justify-center gap-2">
		<i className="i-mdi-magnify w-12 h-12 text-gray-300 dark:text-gray-600" />
		<p className="text-gray-500 dark:text-gray-400 font-medium">
			<Trans>Nothing found</Trans>
		</p>
		<p className="text-sm text-gray-400 dark:text-gray-500">
			<Trans>Try adjusting your search criteria</Trans>
		</p>
	</div>
);
