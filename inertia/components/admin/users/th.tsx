import { Center, Group, rem, Table, Text, UnstyledButton } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { TbChevronDown, TbChevronUp, TbSelector } from 'react-icons/tb';
import classes from './users_table.module.css';

interface ThProps extends PropsWithChildren {
	reversed: boolean;
	sorted: boolean;
	onSort(): void;
}

export function Th({ children, reversed, sorted, onSort }: ThProps) {
	const Icon = sorted ? (reversed ? TbChevronUp : TbChevronDown) : TbSelector;
	return (
		<Table.Th className={classes.th}>
			<UnstyledButton onClick={onSort} className={classes.control}>
				<Group justify="space-between">
					<Text fw={500} fz="sm">
						{children}
					</Text>
					<Center className={classes.icon}>
						<Icon style={{ width: rem(16), height: rem(16) }} />
					</Center>
				</Group>
			</UnstyledButton>
		</Table.Th>
	);
}
