import type { ChangeEvent } from 'react';
import { Checkbox } from '@minimalstuff/ui';

import { cn } from '~/lib/cn';
import { useUsersSorting } from '~/hooks/admin/use_users_sorting';
import { useUsersSelection } from '~/hooks/admin/use_users_selection';
import { DataTable } from '~/components/common/data_table/data_table';
import { useDeleteSelectedUsers } from '~/hooks/admin/use_delete_selected_users';
import { UsersTableToolbar } from '~/components/admin/users/users_table_toolbar';
import { UserSelectCheckbox } from '~/components/admin/users/user_select_checkbox';
import { UsersTableEmptyState } from '~/components/admin/users/users_table_empty_state';
import {
	USERS_TABLE_COLUMNS,
	type UserWithCounters,
} from '~/components/admin/users/users_table_columns';

export type UsersTableProps = {
	users: UserWithCounters[];
};

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
	const { isDeleting, deleteSelected } = useDeleteSelectedUsers(
		selectedUserIds,
		clearSelection
	);

	const getRowKey = (user: UserWithCounters) => String(user.id);

	const getRowClassName = (user: UserWithCounters) =>
		cn(
			'transition-colors',
			user.pendingDeletionAt
				? 'bg-red-50/60 hover:bg-red-50 dark:bg-red-900/10 dark:hover:bg-red-900/20'
				: 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
		);

	const handleSort = (field: string) =>
		setSorting(field as keyof UserWithCounters);

	const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) =>
		setAllVisibleSelected(event.target.checked);

	const leadingColumn = {
		header: (
			<Checkbox
				ref={selectAllCheckboxRef}
				checked={allVisibleSelected}
				onChange={handleSelectAllChange}
				disabled={visibleDeletableCount === 0}
				aria-label="Select all visible users"
			/>
		),
		render: (user: UserWithCounters) => (
			<UserSelectCheckbox
				user={user}
				isSelected={selectedUserIds.has(user.id)}
				onSelectionChange={setUserSelected}
			/>
		),
	};

	return (
		<div className="w-full flex flex-col md:h-full">
			<UsersTableToolbar
				userCount={users.length}
				search={search}
				onSearchChange={setSearch}
				selectedCount={selectedCount}
				isDeleting={isDeleting}
				onDeleteSelected={deleteSelected}
			/>
			<DataTable<UserWithCounters>
				data={sortedData}
				getRowKey={getRowKey}
				minWidthClassName="min-w-[1280px]"
				rowClassName={getRowClassName}
				sorting={{ sortBy, reversed: reverseSortDirection, onSort: handleSort }}
				leadingColumn={leadingColumn}
				columns={USERS_TABLE_COLUMNS}
				emptyState={<UsersTableEmptyState />}
			/>
		</div>
	);
}
