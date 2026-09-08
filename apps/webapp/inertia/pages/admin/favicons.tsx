import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button, ConfirmModal } from '@minimalstuff/ui';

import { formatBytes } from '~/lib/format';
import { AppLayout } from '~/layouts/app_layout';
import { AdminTabs } from '~/components/admin/admin_tabs';
import { useFaviconActions } from '~/hooks/admin/use_favicon_actions';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';

interface FaviconsProps {
	entryCount: number;
	totalBytes: number;
	failureCount: number;
}

function StatCard({
	label,
	value,
	icon,
	tint,
}: Readonly<{
	label: React.ReactNode;
	value: React.ReactNode;
	icon: string;
	tint: string;
}>) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
						{label}
					</p>
					<p className="text-3xl font-bold text-gray-900 dark:text-white">
						{value}
					</p>
				</div>
				<div className={`p-3 rounded-lg ${tint}`}>
					<i className={`${icon} w-8 h-8`} />
				</div>
			</div>
		</div>
	);
}

function Favicons({
	entryCount,
	totalBytes,
	failureCount,
}: Readonly<FaviconsProps>) {
	const { purgeOrphans, flushAll, reResolveFailures, reResolveAll } =
		useFaviconActions();

	const handleFlushAll = () => {
		void ConfirmModal.call({
			title: <Trans>Flush the favicon store</Trans>,
			children: (
				<Trans>
					Every stored favicon is deleted. Links show a monogram until their
					icon is re-scraped on next view — nothing is lost permanently, but
					every domain gets re-fetched again.
				</Trans>
			),
			confirmLabel: <Trans>Flush</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'danger',
			onConfirm: flushAll,
		});
	};

	const handleReResolveAll = () => {
		void ConfirmModal.call({
			title: <Trans>Re-resolve every favicon</Trans>,
			children: (
				<Trans>
					Every known domain is re-scraped in place — links keep their current
					icon until a fresher one actually lands. Can take a while on a large
					store.
				</Trans>
			),
			confirmLabel: <Trans>Re-resolve all</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			onConfirm: reResolveAll,
		});
	};

	return (
		<div className="w-full flex flex-col md:h-full p-4">
			<Head title={t`Favicons`} />
			<AdminTabs />

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<StatCard
					label={<Trans>Stored favicons</Trans>}
					value={entryCount}
					icon="i-mdi-image-multiple text-blue-600 dark:text-blue-400"
					tint="bg-blue-100 dark:bg-blue-900/30"
				/>
				<StatCard
					label={<Trans>Store size</Trans>}
					value={formatBytes(totalBytes)}
					icon="i-mdi-harddisk text-green-600 dark:text-green-400"
					tint="bg-green-100 dark:bg-green-900/30"
				/>
				<StatCard
					label={<Trans>Resolution failures</Trans>}
					value={failureCount}
					icon="i-mdi-alert-circle-outline text-red-600 dark:text-red-400"
					tint="bg-red-100 dark:bg-red-900/30"
				/>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
				<h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
					<Trans>Maintenance</Trans>
				</h2>
				<div className="flex flex-wrap gap-3">
					<Button variant="outline" color="neutral" onClick={purgeOrphans}>
						<Trans>Purge orphaned entries</Trans>
					</Button>
					<Button variant="outline" color="neutral" onClick={reResolveFailures}>
						<Trans>Re-resolve failures</Trans>
					</Button>
					<Button
						variant="outline"
						color="neutral"
						onClick={handleReResolveAll}
					>
						<Trans>Re-resolve all</Trans>
					</Button>
					<Button color="danger" onClick={handleFlushAll}>
						<Trans>Flush store</Trans>
					</Button>
				</div>
			</div>
		</div>
	);
}

Favicons.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`Favicons`} />
		{page}
	</AppLayout>
);

export default Favicons;
