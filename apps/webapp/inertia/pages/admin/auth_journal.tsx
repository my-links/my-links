import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { AppLayout } from '~/layouts/app_layout';
import { InertiaProps } from '~/lib/inertia_props';
import { AdminTabs } from '~/components/admin/admin_tabs';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';
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
		<div className="w-full flex flex-col md:h-full p-4">
			<Head title={t`Auth Journal`} />

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

AuthJournal.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`Auth Journal`} />
		{page}
	</AppLayout>
);
