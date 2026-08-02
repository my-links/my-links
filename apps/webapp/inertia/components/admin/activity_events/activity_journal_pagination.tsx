import { Trans } from '@lingui/react/macro';
import { Link } from '@adonisjs/inertia/react';

import { urlFor } from '~/lib/tuyau';

interface ActivityJournalPaginationProps {
	currentPage: number;
	lastPage: number;
}

const LINK_CLASS =
	'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';

const journalPageUrl = (page: number) =>
	`${urlFor('admin.activityEvents')}?page=${page}`;

export const ActivityJournalPagination = ({
	currentPage,
	lastPage,
}: Readonly<ActivityJournalPaginationProps>) => (
	<div className="flex items-center justify-between gap-4 pt-4">
		{currentPage > 1 ? (
			<Link href={journalPageUrl(currentPage - 1)} className={LINK_CLASS}>
				<i className="i-mdi-chevron-left w-4 h-4" />
				<Trans>Newer</Trans>
			</Link>
		) : (
			<span />
		)}

		<span className="text-sm text-gray-500 dark:text-gray-400">
			<Trans>
				Page {currentPage} of {lastPage}
			</Trans>
		</span>

		{currentPage < lastPage ? (
			<Link href={journalPageUrl(currentPage + 1)} className={LINK_CLASS}>
				<Trans>Older</Trans>
				<i className="i-mdi-chevron-right w-4 h-4" />
			</Link>
		) : (
			<span />
		)}
	</div>
);
