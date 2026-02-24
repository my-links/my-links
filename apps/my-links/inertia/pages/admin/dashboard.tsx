import { UserWithCounters } from '#shared/types/dto';
import { PageProps } from '@adonisjs/inertia/types';
import { Trans } from '@lingui/react/macro';
import { UsersTable } from '~/components/admin/users/users_table';

interface AdminDashboardProps extends PageProps {
	users: UserWithCounters[];
	totalCollections: number;
	totalLinks: number;
}

const AdminDashboard = ({
	users,
	totalCollections,
	totalLinks,
}: AdminDashboardProps) => (
	<div className="w-full h-full flex flex-col">
		<div className="mb-6">
			<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
				<Trans>Admin Dashboard</Trans>
			</h1>
		</div>

		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
							<Trans>Total Users</Trans>
						</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-white">
							{users.length}
						</p>
					</div>
					<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
						<i className="i-mdi-account-group w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
							<Trans>Total Collections</Trans>
						</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-white">
							{totalCollections}
						</p>
					</div>
					<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
						<i className="i-mdi-folder-multiple w-8 h-8 text-green-600 dark:text-green-400" />
					</div>
				</div>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
							<Trans>Total Links</Trans>
						</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-white">
							{totalLinks}
						</p>
					</div>
					<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
						<i className="i-mdi-link-variant w-8 h-8 text-purple-600 dark:text-purple-400" />
					</div>
				</div>
			</div>
		</div>

		<div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
			<UsersTable users={users} />
		</div>
	</div>
);

export default AdminDashboard;
