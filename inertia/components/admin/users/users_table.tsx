import { UserWithCounters } from '#shared/types/dto';
import { Trans } from '@lingui/react/macro';
import { ChangeEvent, useState } from 'react';
import { Th } from '~/components/admin/users/th';
import { sortData } from '~/components/admin/users/utils';
import { UserBadgeRole } from '~/components/common/user_badge_role';

export type Columns = keyof UserWithCounters;

const DEFAULT_SORT_BY: Columns = 'lastSeenAt';
const DEFAULT_SORT_DIRECTION = true;

export interface UsersTableProps {
	users: UserWithCounters[];
}

export function UsersTable({ users }: UsersTableProps) {
	const [search, setSearch] = useState<string>('');
	const [sortBy, setSortBy] = useState<Columns | null>(DEFAULT_SORT_BY);
	const [reverseSortDirection, setReverseSortDirection] = useState(
		DEFAULT_SORT_DIRECTION
	);
	const [sortedData, setSortedData] = useState(() =>
		sortData(users, {
			sortBy: sortBy,
			reversed: reverseSortDirection,
			search: '',
		})
	);

	const setSorting = (field: keyof UserWithCounters) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(users, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(
			sortData(users, {
				sortBy: sortBy,
				reversed: reverseSortDirection,
				search: value,
			})
		);
	};

	const rows = sortedData.map((user) => (
		<tr
			key={user.id}
			className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
		>
			<td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
						{user.fullname.charAt(0).toUpperCase()}
					</div>
					<span>{user.fullname}</span>
				</div>
			</td>
			<td className="px-6 py-4">
				<UserBadgeRole user={user} />
			</td>
			<td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
					<i className="i-mdi-folder w-4 h-4" />
					{user.collectionsCount}
				</span>
			</td>
			<td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
				<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
					<i className="i-mdi-link w-4 h-4" />
					{user.linksCount}
				</span>
			</td>
			<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
				{user.createdAt}
			</td>
			<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
				{user.lastSeenAt}
			</td>
		</tr>
	));

	return (
		<div className="w-full h-full flex flex-col">
			<div className="mb-4 flex items-center justify-between gap-4">
				<div className="flex-1 relative max-w-md">
					<i className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
					<input
						type="text"
						placeholder={`Search by any field (${users.length} users)`}
						value={search}
						onChange={handleSearchChange}
						className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
					/>
				</div>
				{search && (
					<button
						onClick={() => {
							setSearch('');
							setSortedData(
								sortData(users, {
									sortBy: sortBy,
									reversed: reverseSortDirection,
									search: '',
								})
							);
						}}
						className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
					>
						<i className="i-mdi-close w-4 h-4" />
						<Trans>Clear</Trans>
					</button>
				)}
			</div>
			<div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
				<table className="w-full min-w-[700px] border-collapse">
					<thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
						<tr>
							<Th
								sorted={sortBy === 'fullname'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('fullname')}
							>
								<Trans>Name</Trans>
							</Th>
							<Th
								sorted={sortBy === 'isAdmin'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('isAdmin')}
							>
								<Trans>Role</Trans>
							</Th>
							<Th
								sorted={sortBy === 'collectionsCount'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('collectionsCount')}
							>
								<Trans>Collections</Trans>
							</Th>
							<Th
								sorted={sortBy === 'linksCount'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('linksCount')}
							>
								<Trans>Links</Trans>
							</Th>
							<Th
								sorted={sortBy === 'createdAt'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('createdAt')}
							>
								<Trans>Created at</Trans>
							</Th>
							<Th
								sorted={sortBy === 'lastSeenAt'}
								reversed={reverseSortDirection}
								onSort={() => setSorting('lastSeenAt')}
							>
								<Trans>Last seen at</Trans>
							</Th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{rows.length > 0 ? (
							rows
						) : (
							<tr>
								<td colSpan={6} className="px-4 py-12 text-center">
									<div className="flex flex-col items-center justify-center gap-2">
										<i className="i-mdi-magnify w-12 h-12 text-gray-300 dark:text-gray-600" />
										<p className="text-gray-500 dark:text-gray-400 font-medium">
											<Trans>Nothing found</Trans>
										</p>
										<p className="text-sm text-gray-400 dark:text-gray-500">
											<Trans>Try adjusting your search criteria</Trans>
										</p>
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
