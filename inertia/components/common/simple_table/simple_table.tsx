import { ScrollArea, Table, Text } from '@mantine/core';
import cx from 'clsx';
import { useState } from 'react';
import classes from './simple_table.module.css';

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

	const rows = data.map((row) => {
		return (
			<Table.Tr key={row.key}>
				{columns.map((column) => (
					<Table.Td key={column}>
						{row[column] ?? (
							<Text c="dimmed" size="sm">
								N/A
							</Text>
						)}
					</Table.Td>
				))}
			</Table.Tr>
		);
	});

	return (
		<ScrollArea
			h={300}
			onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
		>
			<Table miw={700}>
				<Table.Thead
					className={cx(classes.header, { [classes.scrolled]: scrolled })}
				>
					<Table.Tr>
						{columns.map((column) => (
							<Table.Th key={column}>{column}</Table.Th>
						))}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}
