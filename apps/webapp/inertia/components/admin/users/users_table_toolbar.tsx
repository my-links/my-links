import { ChangeEvent } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button, Input } from '@minimalstuff/ui';

type UsersTableToolbarProps = {
	userCount: number;
	search: string;
	onSearchChange: (search: string) => void;
	selectedCount: number;
	isDeleting: boolean;
	onDeleteSelected: () => void;
};

export function UsersTableToolbar({
	userCount,
	search,
	onSearchChange,
	selectedCount,
	isDeleting,
	onDeleteSelected,
}: Readonly<UsersTableToolbarProps>) {
	const canDelete = selectedCount > 0 && !isDeleting;

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
		onSearchChange(event.currentTarget.value);

	const handleClearSearch = () => onSearchChange('');

	return (
		<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
			<div className="flex-1 relative sm:max-w-md">
				<i className="i-tabler-search absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
				<Input
					type="text"
					placeholder={`Search by any field (${userCount} users)`}
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
					onClick={onDeleteSelected}
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
	);
}
