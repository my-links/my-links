import { useState } from 'react';

export type SimpleTableData = {
	key: string;
	[key: string]: string | React.ReactNode | undefined;
	actions?: React.ReactNode[];
};

interface SimpleTableProps {
	data: SimpleTableData[];
}

export function SimpleTable({ data }: SimpleTableProps) {
	const [scrolled, setScrolled] = useState(false);

	const columns = data.length > 0 ? Object.keys(data[0]) : [];

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const target = e.currentTarget;
		setScrolled(target.scrollTop > 0);
	};

	const rows = data.map((row) => {
		return (
			<tr
				key={row.key}
				className="border-b border-gray-200 dark:border-gray-700"
			>
				{columns.map((column) => (
					<td key={column} className="px-4 py-3 text-sm">
						{row[column] ?? (
							<span className="text-gray-400 dark:text-gray-500">N/A</span>
						)}
					</td>
				))}
			</tr>
		);
	});

	return (
		<div
			className="overflow-auto"
			style={{ maxHeight: '300px' }}
			onScroll={handleScroll}
		>
			<table className="min-w-[700px] w-full">
				<thead
					className={`sticky top-0 bg-white dark:bg-gray-800 transition-shadow ${
						scrolled ? 'shadow-sm' : ''
					}`}
				>
					<tr className="border-b border-gray-200 dark:border-gray-700">
						{columns.map((column) => (
							<th
								key={column}
								className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
							>
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
					{rows}
				</tbody>
			</table>
		</div>
	);
}
