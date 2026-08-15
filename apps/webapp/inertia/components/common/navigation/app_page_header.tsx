import type { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { AccountMenu } from '~/components/common/navigation/account_menu';

interface AppPageHeaderProps {
	title: ReactNode;
}

/**
 * Slim navigation bar for app pages that have no sidebar of their own
 * (settings, admin, status): a way back to the dashboard, the page title,
 * and the account menu. Never used by the dashboard itself.
 */
export function AppPageHeader({ title }: Readonly<AppPageHeaderProps>) {
	return (
		<div className="shrink-0 p-4 flex items-center justify-between gap-4 mb-4">
			<Link
				route="collection.favorites"
				className="flex items-center gap-1.5 shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
			>
				<i className="i-mdi-arrow-left h-4 w-4 block" />
				<Trans>Dashboard</Trans>
			</Link>
			<h1 className="flex-1 min-w-0 truncate text-center text-sm font-semibold text-gray-900 dark:text-white">
				{title}
			</h1>
			<AccountMenu side="bottom" />
		</div>
	);
}
