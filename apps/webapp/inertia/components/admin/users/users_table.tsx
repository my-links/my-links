import type { Data } from '@generated/data';
import { router } from '@inertiajs/react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@minimalstuff/ui';
import { ChangeEvent, useState } from 'react';
import { ClientOnly } from '~/components/common/client_only';
import { DataTable } from '~/components/common/data_table/data_table';
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
			<DataTable<UserWithCounters>
				data={sortedData}
				getRowKey={(user) => String(user.id)}
				sorting={{
					sortBy,
					reversed: reverseSortDirection,
					onSort: (field) => setSorting(field as keyof UserWithCounters),
				}}
				leadingColumn={{
					header: (
						<input
							ref={selectAllCheckboxRef}
							type="checkbox"
							checked={allVisibleSelected}
							onChange={(e) => setAllVisibleSelected(e.target.checked)}
							disabled={visibleDeletableCount === 0}
							className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							aria-label="Select all visible users"
						/>
					),
					render: (user) => (
						<input
							type="checkbox"
							checked={selectedUserIds.has(user.id)}
							disabled={user.isAdmin}
							onChange={(e) => setUserSelected(user.id, e.target.checked)}
							className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							aria-label={`Select user ${user.fullname}`}
						/>
					),
				}}
				columns={[
					{
						key: 'fullname',
						header: <Trans>Name</Trans>,
						sortKey: 'fullname',
						cellClassName:
							'px-6 py-4 text-sm font-medium text-gray-900 dark:text-white',
						render: (user) => (
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
									{user.fullname.charAt(0).toUpperCase()}
								</div>
								<span>{user.fullname}</span>
							</div>
						),
					},
					{
						key: 'role',
						header: <Trans>Role</Trans>,
						sortKey: 'isAdmin',
						cellClassName: 'px-6 py-4',
						render: (user) => <UserBadgeRole user={user} />,
					},
					{
						key: 'collectionsCount',
						header: <Trans>Collections</Trans>,
						sortKey: 'collectionsCount',
						cellClassName:
							'px-6 py-4 text-sm text-gray-900 dark:text-white text-center',
						render: (user) => (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
								<i className="i-mdi-folder w-4 h-4" />
								{user.collectionsCount}
							</span>
						),
					},
					{
						key: 'linksCount',
						header: <Trans>Links</Trans>,
						sortKey: 'linksCount',
						cellClassName:
							'px-6 py-4 text-sm text-gray-900 dark:text-white text-center',
						render: (user) => (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
								<i className="i-mdi-link w-4 h-4" />
								{user.linksCount}
							</span>
						),
					},
					{
						key: 'createdAt',
						header: <Trans>Created at</Trans>,
						sortKey: 'createdAt',
						cellClassName: 'px-6 py-4 text-sm text-gray-600 dark:text-gray-400',
						render: (user) => (
							<ClientOnly>
								{user.createdAt ? formatDate(user.createdAt) : <NaContent />}
							</ClientOnly>
						),
					},
					{
						key: 'lastSeenAt',
						header: <Trans>Last seen at</Trans>,
						sortKey: 'lastSeenAt',
						cellClassName: 'px-6 py-4 text-sm text-gray-600 dark:text-gray-400',
						render: (user) => (
							<ClientOnly>
								{user.lastSeenAt ? formatDate(user.lastSeenAt) : <NaContent />}
							</ClientOnly>
						),
					},
				]}
				emptyState={
					<div className="flex flex-col items-center justify-center gap-2">
						<i className="i-mdi-magnify w-12 h-12 text-gray-300 dark:text-gray-600" />
						<p className="text-gray-500 dark:text-gray-400 font-medium">
							<Trans>Nothing found</Trans>
						</p>
						<p className="text-sm text-gray-400 dark:text-gray-500">
							<Trans>Try adjusting your search criteria</Trans>
						</p>
					</div>
				}
			/>
		</div>
	);
}
