import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { InertiaProps } from '~/types/inertia';
import { AdminTabs } from '~/components/admin/admin_tabs';
import { AuthEventsTable } from '~/components/admin/auth_events/auth_events_table';
import { JournalPagination } from '~/components/admin/auth_events/journal_pagination';

type PageProps = InertiaProps<{
	events: Data.AuthEvent[];
	currentPage: number;
	lastPage: number;
	totalEvents: number;
}>;

export default function AuthJournal({
	events,
	currentPage,
	lastPage,
	totalEvents,
}: Readonly<PageProps>) {
	return (
		<div className="w-full flex flex-col md:h-full">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					<Trans>Admin Dashboard</Trans>
				</h1>
			</div>

			<AdminTabs />

			<div className="mb-4 flex items-baseline justify-between gap-4">
				<p className="text-sm text-gray-600 dark:text-gray-400">
					<Trans>
						Every authentication event this instance recorded, newest first.
					</Trans>
				</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					<Trans>{totalEvents} events</Trans>
				</p>
			</div>

			<div className="md:flex-1 md:min-h-0 flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-6">
				<AuthEventsTable events={events} />
				<JournalPagination currentPage={currentPage} lastPage={lastPage} />
			</div>
		</div>
	);
}
