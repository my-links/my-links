import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { cn } from '~/lib/cn';

const TAB_CLASS =
	'flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 font-medium text-sm transition-colors whitespace-nowrap';
const ACTIVE_TAB_CLASS =
	'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400';
const INACTIVE_TAB_CLASS =
	'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';

// `page` is the Inertia component name, which the status page renders as
// `status` rather than `admin/status` despite living behind `/admin`.
const ADMIN_TABS = [
	{
		route: 'admin.dashboard',
		page: 'admin/dashboard',
		icon: 'i-mdi-account-group',
		label: <Trans>Accounts</Trans>,
	},
	{
		route: 'admin.auth-events',
		page: 'admin/auth_journal',
		icon: 'i-mdi-history',
		label: <Trans>Authentication journal</Trans>,
	},
	{
		route: 'admin.activity-events',
		page: 'admin/activity_journal',
		icon: 'i-mdi-clipboard-text-clock',
		label: <Trans>Activity journal</Trans>,
	},
	{
		route: 'admin.status',
		page: 'admin/status',
		icon: 'i-mdi-heart-pulse',
		label: <Trans>Status</Trans>,
	},
] as const;

/**
 * The sections of the admin area. Real links rather than client-side tabs:
 * the journals are paginated server-side, so their page belongs in the URL.
 */
export function AdminTabs() {
	const { component } = usePage();

	return (
		<nav className="flex items-center gap-2 overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-gray-700 mb-6">
			{ADMIN_TABS.map((tab) => (
				<Link
					key={tab.route}
					route={tab.route}
					className={cn(
						TAB_CLASS,
						component === tab.page ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
					)}
				>
					<i className={cn(tab.icon, 'w-4 h-4')} />
					{tab.label}
				</Link>
			))}
		</nav>
	);
}
