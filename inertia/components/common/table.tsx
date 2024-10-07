import styled from '@emotion/styled';
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	PaginationState,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import IconButton from '~/components/common/icon_button';

import {
	MdKeyboardArrowLeft,
	MdKeyboardArrowRight,
	MdKeyboardDoubleArrowLeft,
	MdKeyboardDoubleArrowRight,
} from 'react-icons/md';
import Input from '~/components/common/form/_input';

const TablePageFooter = styled.div({
	display: 'flex',
	gap: '1em',
	alignItems: 'center',
});

const Box = styled(TablePageFooter)({
	gap: '0.35em',
});

const Resizer = styled.div<{ isResizing: boolean }>(
	({ theme, isResizing }) => ({
		cursor: 'col-resize',
		userSelect: 'none',
		touchAction: 'none',
		position: 'absolute',
		right: 0,
		top: 0,
		height: '100%',
		width: '5px',
		opacity: !isResizing ? 0 : 1,
		background: !isResizing ? theme.colors.white : theme.colors.primary,
		'&:hover': {
			opacity: 0.5,
		},
	})
);

type TableProps<T> = {
	columns: ColumnDef<T>[];
	data: T[];
	defaultSorting?: SortingState;
};

export default function Table<T>({
	columns,
	data,
	defaultSorting = [],
}: TableProps<T>) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [sorting, setSorting] = useState<SortingState>(defaultSorting);

	const table = useReactTable({
		data,
		columns,
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		debugTable: true,
	});

	return (
		<div css={{ fontSize: '0.9rem', paddingBlock: '1em' }}>
			<div
				css={{
					maxWidth: '100%',
					marginBottom: '1em',
					display: 'block',
					overflowX: 'auto',
					overflowY: 'hidden',
				}}
			>
				<table>
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										style={{
											width: header.getSize(),
										}}
										css={{
											position: 'relative',
											userSelect: 'none',
											// resizer
											'&:hover > div > div': {
												opacity: 0.5,
											},
										}}
										colSpan={header.colSpan}
									>
										{header.isPlaceholder ? null : (
											<div
												css={{
													cursor: header.column.getCanSort()
														? 'pointer'
														: 'default',
												}}
												onClick={header.column.getToggleSortingHandler()}
												title={
													header.column.getCanSort()
														? header.column.getNextSortingOrder() === 'asc'
															? 'Sort ascending'
															: header.column.getNextSortingOrder() === 'desc'
																? 'Sort descending'
																: 'Clear sort'
														: undefined
												}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext()
												)}
												{{
													asc: ' 🔼',
													desc: ' 🔽',
												}[header.column.getIsSorted() as string] ?? null}
												{header.column.getCanResize() && (
													<Resizer
														onMouseDown={header.getResizeHandler()}
														onTouchStart={header.getResizeHandler()}
														isResizing={header.column.getIsResizing()}
													/>
												)}
											</div>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table
							.getRowModel()
							.rows.slice(0, 10)
							.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} style={{ width: cell.column.getSize() }}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									))}
								</tr>
							))}
					</tbody>
				</table>
			</div>
			{table.getPageCount() > 1 && (
				<TablePageFooter>
					<Box>
						<IconButton
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<MdKeyboardDoubleArrowLeft />
						</IconButton>
						<IconButton
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<MdKeyboardArrowLeft />
						</IconButton>
						<IconButton
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<MdKeyboardArrowRight />
						</IconButton>
						<IconButton
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<MdKeyboardDoubleArrowRight />
						</IconButton>
					</Box>
					<Box>
						<span>Page</span>
						<strong>
							{table.getState().pagination.pageIndex + 1} of{' '}
							{table.getPageCount()}
						</strong>
					</Box>
					<Box>
						Go to page
						<Input
							type="number"
							min="1"
							max={table.getPageCount()}
							defaultValue={table.getState().pagination.pageIndex + 1}
							onChange={(e) => {
								const page = e.target.value ? Number(e.target.value) - 1 : 0;
								table.setPageIndex(page);
							}}
						/>
					</Box>
				</TablePageFooter>
			)}
		</div>
	);
}
