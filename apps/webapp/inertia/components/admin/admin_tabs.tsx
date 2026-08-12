import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

const TAB_CLASS =
	'flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 font-medium text-sm transition-colors';
const ACTIVE_TAB_CLASS =
	'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400';
const INACTIVE_TAB_CLASS =
	'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200';

const ACCOUNTS_PAGE = 'admin/dashboard';
const JOURNAL_PAGE = 'admin/auth_journal';
const ACTIVITY_JOURNAL_PAGE = 'admin/activity_journal';

/**
 * The two halves of the admin area. Real links rather than client-side tabs:
 * the journal is paginated server-side, so its page belongs in the URL.
 */
export function AdminTabs() {
	const { component } = usePage();

	const tabClassFor = (page: string) =>
		clsx(TAB_CLASS, component === page ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS);

	return (
		<nav className="flex items-center gap-2 overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-gray-700 mb-6">
			<Link
				route="admin.dashboard"
				className={clsx(tabClassFor(ACCOUNTS_PAGE), 'whitespace-nowrap')}
			>
				<i className="i-mdi-account-group w-4 h-4" />
				<Trans>Accounts</Trans>
			</Link>
			<Link
				route="admin.auth-events"
				className={clsx(tabClassFor(JOURNAL_PAGE), 'whitespace-nowrap')}
			>
				<i className="i-mdi-history w-4 h-4" />
				<Trans>Authentication journal</Trans>
			</Link>
			<Link
				route="admin.activity-events"
				className={clsx(
					tabClassFor(ACTIVITY_JOURNAL_PAGE),
					'whitespace-nowrap'
				)}
			>
				<i className="i-mdi-clipboard-text-clock w-4 h-4" />
				<Trans>Activity journal</Trans>
			</Link>
		</nav>
	);
}
