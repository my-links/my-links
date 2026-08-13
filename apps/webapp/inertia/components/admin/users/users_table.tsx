import { router } from '@inertiajs/react';
import type { Data } from '@generated/data';
import { Trans } from '@lingui/react/macro';
import { ChangeEvent, useState } from 'react';
import {
	Button,
	Checkbox,
	ClientOnly,
	ConfirmModal,
	Input,
} from '@minimalstuff/ui';

import { urlFor } from '~/lib/tuyau';
import { formatDate } from '~/lib/format';
import { NaContent } from '~/components/common/na_content';
import { UserIdentity } from '~/components/common/user_identity';
import { useUsersSorting } from '~/hooks/admin/use_users_sorting';
import { UserBadgeRole } from '~/components/common/user_badge_role';
import { DataTable } from '~/components/common/data_table/data_table';
import { useUsersSelection } from '~/hooks/admin/use_users_selection';
import { AccountActions } from '~/components/admin/users/account_actions';
import { AuthMethodsCell } from '~/components/admin/users/auth_methods_cell';
import { EmailVerificationBadge } from '~/components/admin/users/email_verification_badge';

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
		void ConfirmModal.call({
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
				const bulkDeleteUrl = urlFor('admin.users.bulk-delete');
				router.post(
					bulkDeleteUrl,
					{ userIds: targetIds },
					{
						preserveScroll: true,
						onSuccess: () => {
							clearSelection();
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
		<div className="w-full flex flex-col md:h-full">
			<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
				<div className="flex-1 relative sm:max-w-md">
					<i className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
					<Input
						type="text"
						placeholder={`Search by any field (${users.length} users)`}
						value={search}
						onChange={handleSearchChange}
						className="pl-10"
					/>
				</div>
				<div className="flex items-center gap-3">
					<Button
						color="danger"
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
				minWidthClassName="min-w-[1280px]"
				sorting={{
					sortBy,
					reversed: reverseSortDirection,
					onSort: (field) => setSorting(field as keyof UserWithCounters),
				}}
				leadingColumn={{
					header: (
						<Checkbox
							ref={selectAllCheckboxRef}
							checked={allVisibleSelected}
							onChange={(e) => setAllVisibleSelected(e.target.checked)}
							disabled={visibleDeletableCount === 0}
							aria-label="Select all visible users"
						/>
					),
					render: (user) => (
						<Checkbox
							checked={selectedUserIds.has(user.id)}
							disabled={user.isAdmin}
							onChange={(e) => setUserSelected(user.id, e.target.checked)}
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
						render: (user) => <UserIdentity fullname={user.fullname} />,
					},
					{
						key: 'role',
						header: <Trans>Role</Trans>,
						sortKey: 'isAdmin',
						cellClassName: 'px-6 py-4',
						render: (user) => <UserBadgeRole user={user} />,
					},
					{
						key: 'emailVerifiedAt',
						header: <Trans>Email</Trans>,
						sortKey: 'emailVerifiedAt',
						cellClassName: 'px-6 py-4',
						render: (user) => (
							<EmailVerificationBadge emailVerifiedAt={user.emailVerifiedAt} />
						),
					},
					{
						key: 'authMethods',
						header: <Trans>Sign-in methods</Trans>,
						cellClassName: 'px-6 py-4',
						render: (user) => (
							<AuthMethodsCell authMethods={user.authMethods} />
						),
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
						key: 'followedCollectionsCount',
						header: <Trans>Followed</Trans>,
						sortKey: 'followedCollectionsCount',
						cellClassName:
							'px-6 py-4 text-sm text-gray-900 dark:text-white text-center',
						render: (user) => (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
								<i className="i-mdi-star w-4 h-4" />
								{user.followedCollectionsCount}
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
					{
						key: 'lastLoginAt',
						header: <Trans>Last sign-in</Trans>,
						sortKey: 'lastLoginAt',
						cellClassName: 'px-6 py-4 text-sm text-gray-600 dark:text-gray-400',
						render: (user) => (
							<ClientOnly>
								{user.lastLoginAt ? (
									formatDate(user.lastLoginAt)
								) : (
									<NaContent />
								)}
							</ClientOnly>
						),
					},
					{
						key: 'actions',
						header: <Trans>Actions</Trans>,
						cellClassName: 'px-6 py-4',
						render: (user) => <AccountActions account={user} />,
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
