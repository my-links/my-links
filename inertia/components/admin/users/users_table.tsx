import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { ChangeEvent, useState } from 'react';
import { Th } from '~/components/admin/users/th';
import { ClientOnly } from '~/components/common/client_only';
import { NaContent } from '~/components/common/na_content';
import { UserBadgeRole } from '~/components/common/user_badge_role';
import { useUsersSelection } from '~/hooks/admin/use_users_selection';
import { useUsersSorting } from '~/hooks/admin/use_users_sorting';
import { formatDate } from '~/lib/format';
import { urlFor } from '~/lib/tuyau';
import { useModalStore } from '~/stores/modal_store';

type UserWithCounters = Data.User.Variants['withCounters'];

export interface UsersTableProps {
	users: UserWithCounters[];
}

export function UsersTable({ users }: Readonly<UsersTableProps>) {
	const {
		search,
		setSearch,
		sortBy,
		reverseSortDirection,
		setSorting,
		sortedData,
	} = useUsersSorting(users);
	const {
		selectedUserIds,
		selectedCount,
		allVisibleSelected,
		selectAllCheckboxRef,
		visibleDeletableCount,
		setUserSelected,
		setAllVisibleSelected,
		clearSelection,
	} = useUsersSelection(users, sortedData);

	const [isDeleting, setIsDeleting] = useState(false);
	const canDelete = selectedCount > 0 && !isDeleting;

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
		setSearch(event.currentTarget.value);

	const handleClearSearch = () => setSearch('');

	const handleDeleteSelected = () => {
		if (selectedCount === 0) return;

		const targetIds = Array.from(selectedUserIds);
		const modalId = useModalStore.getState().openConfirm({
			title: <Trans>Delete accounts</Trans>,
			children: (
				<Trans>
					You are about to delete {targetIds.length} account(s). This action
					cannot be undone. All related collections and links will be
					permanently deleted.
				</Trans>
			),
			confirmLabel: <Trans>Delete</Trans>,
			cancelLabel: <Trans>Cancel</Trans>,
			confirmColor: 'red',
			onConfirm: async () => {
				setIsDeleting(true);
				const bulkDeleteUrl = urlFor('admin.users.bulkDelete');
				router.post(
					bulkDeleteUrl,
					{ userIds: targetIds },
					{
						preserveScroll: true,
						onSuccess: () => {
							clearSelection();
							useModalStore.getState().close(modalId);
						},
						onFinish: () => {
							setIsDeleting(false);
						},
					}
				);
			},
		});
	};

	const rows = sortedData.map((user) => (
		<tr
			key={user.id}
			className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
		>
			<td className="px-6 py-4">
				<input
					type="checkbox"
					checked={selectedUserIds.has(user.id)}
					disabled={user.isAdmin}
					onChange={(e) => setUserSelected(user.id, e.target.checked)}
					className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
					aria-label={`Select user ${user.fullname}`}
				/>
			</td>
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
				<ClientOnly>
					{user.createdAt ? formatDate(user.createdAt) : <NaContent />}
				</ClientOnly>
			</td>
			<td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
				<ClientOnly>
					{user.lastSeenAt ? formatDate(user.lastSeenAt) : <NaContent />}
				</ClientOnly>
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
				<div className="flex items-center gap-3">
					<Button
						variant="danger"
						size="sm"
						disabled={!canDelete}
						onClick={handleDeleteSelected}
					>
						{isDeleting && (
							<span
								className="i-svg-spinners-3-dots-fade w-4 h-4"
								aria-hidden="true"
							/>
						)}
						<Trans>Delete selected</Trans>
						{selectedCount > 0 ? ` (${selectedCount})` : ''}
					</Button>

					{search && (
						<button
							onClick={handleClearSearch}
							className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
						>
							<i className="i-mdi-close w-4 h-4" />
							<Trans>Clear</Trans>
						</button>
					)}
				</div>
			</div>
			<div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
				<table className="w-full min-w-[760px] border-collapse">
					<thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
						<tr>
							<th className="px-6 py-4 w-12">
								<input
									ref={selectAllCheckboxRef}
									type="checkbox"
									checked={allVisibleSelected}
									onChange={(e) => setAllVisibleSelected(e.target.checked)}
									disabled={visibleDeletableCount === 0}
									className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
									aria-label="Select all visible users"
								/>
							</th>
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
								<td colSpan={7} className="px-4 py-12 text-center">
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
