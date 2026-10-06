import { t } from '@lingui/core/macro';
import { Head } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';

import { AppLayout } from '~/layouts/app_layout';
import { InertiaProps } from '~/lib/inertia_props';
import { StatCard } from '~/components/admin/stat_card';
import { AdminTabs } from '~/components/admin/admin_tabs';
import { UsersTable } from '~/components/admin/users/users_table';
import { AppPageHeader } from '~/components/common/navigation/app_page_header';

type PageProps = InertiaProps<{
	users: Data.User.Variants['withCounters'][];
	totalCollections: number;
	totalLinks: number;
}>;

export default function AdminDashboard({
	users,
	totalCollections,
	totalLinks,
}: Readonly<PageProps>) {
	return (
		<div className="w-full flex flex-col md:h-full p-4">
			<Head title={t`Admin Dashboard`} />

			<AdminTabs />

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<StatCard
					label={<Trans>Total Users</Trans>}
					value={users.length}
					icon="i-mdi-account-group text-blue-600 dark:text-blue-400"
					tint="bg-blue-100 dark:bg-blue-900/30"
				/>
				<StatCard
					label={<Trans>Total Collections</Trans>}
					value={totalCollections}
					icon="i-mdi-folder-multiple text-green-600 dark:text-green-400"
					tint="bg-green-100 dark:bg-green-900/30"
				/>
				<StatCard
					label={<Trans>Total Links</Trans>}
					value={totalLinks}
					icon="i-mdi-link-variant text-purple-600 dark:text-purple-400"
					tint="bg-purple-100 dark:bg-purple-900/30"
				/>
			</div>

			<div className="md:flex-1 md:min-h-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-3 sm:p-6">
				<UsersTable users={users} />
			</div>
		</div>
	);
}

AdminDashboard.layout = (page: React.ReactNode) => (
	<AppLayout>
		<AppPageHeader title={t`Admin Dashboard`} />
		{page}
	</AppLayout>
);
