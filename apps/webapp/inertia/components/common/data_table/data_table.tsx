import clsx from 'clsx';
import type { CSSProperties, ReactNode } from 'react';
import { SortableTh } from '~/components/common/data_table/sortable_th';

export type DataTableColumn<TData> = {
	key: string;
	header: ReactNode;
	render: (row: TData) => ReactNode;
	sortKey?: string;
	cellClassName?: string;
};

export type DataTableSorting = {
	sortBy: string;
	reversed: boolean;
	onSort: (sortKey: string) => void;
};

export type DataTableLeadingColumn<TData> = {
	header: ReactNode;
	render: (row: TData) => ReactNode;
	cellClassName?: string;
};

interface DataTableProps<TData> {
	data: TData[];
	getRowKey: (row: TData) => string;
	columns: Array<DataTableColumn<TData>>;
	leadingColumn?: DataTableLeadingColumn<TData>;
	sorting?: DataTableSorting;
	emptyState?: ReactNode;
	rowClassName?: (row: TData) => string;
	containerClassName?: string;
	containerStyle?: CSSProperties;
	tableClassName?: string;
	theadClassName?: string;
	tbodyClassName?: string;
	headerCellClassName?: string;
	minWidthClassName?: string;
	bordered?: boolean;
}

export function DataTable<TData>({
	data,
	getRowKey,
	columns,
	leadingColumn,
	sorting,
	emptyState,
	rowClassName,
	containerClassName,
	containerStyle,
	tableClassName,
	theadClassName,
	tbodyClassName,
	headerCellClassName,
	minWidthClassName,
	bordered = true,
}: Readonly<DataTableProps<TData>>) {
	const colSpan = columns.length + (leadingColumn ? 1 : 0);

	return (
		<div
			className={clsx(
				'flex-1 overflow-auto',
				bordered && 'rounded-lg border border-gray-200 dark:border-gray-700',
				containerClassName
			)}
			style={containerStyle}
		>
			<table
				className={clsx(
					'w-full border-collapse',
					minWidthClassName ?? 'min-w-[760px]',
					tableClassName
				)}
			>
				<thead
					className={clsx(
						'bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700',
						theadClassName
					)}
				>
					<tr>
						{leadingColumn && (
							<th className="px-6 py-4 w-12">{leadingColumn.header}</th>
						)}
						{columns.map((column) => {
							const sortKey = column.sortKey;
							if (sortKey && sorting) {
								return (
									<SortableTh
										key={column.key}
										sorted={sorting.sortBy === sortKey}
										reversed={sorting.reversed}
										onSort={() => sorting.onSort(sortKey)}
									>
										{column.header}
									</SortableTh>
								);
							}

							return (
								<th
									key={column.key}
									className={clsx(
										'px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
										headerCellClassName
									)}
								>
									{column.header}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody
					className={clsx(
						'bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700',
						tbodyClassName
					)}
				>
					{data.length > 0 ? (
						data.map((row) => (
							<tr
								key={getRowKey(row)}
								className={
									rowClassName?.(row) ??
									'hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors'
								}
							>
								{leadingColumn && (
									<td className={leadingColumn.cellClassName ?? 'px-6 py-4'}>
										{leadingColumn.render(row)}
									</td>
								)}
								{columns.map((column) => (
									<td
										key={column.key}
										className={column.cellClassName ?? 'px-6 py-4'}
									>
										{column.render(row)}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td colSpan={colSpan} className="px-4 py-12 text-center">
								{emptyState}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
}
