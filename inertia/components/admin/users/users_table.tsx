import {
	Badge,
	ScrollArea,
	Table,
	Text,
	TextInput,
	Tooltip,
	rem,
} from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TbSearch } from 'react-icons/tb';
import { Th } from '~/components/admin/users/th';
import { sortData } from '~/components/admin/users/utils';
import { DATE_FORMAT } from '~/constants';
import { User } from '~/types/app';

dayjs.extend(relativeTime);

export type UserWithCounts = User & {
	linksCount: number;
	collectionsCount: number;
};
export type UsersWithCounts = UserWithCounts[];

export interface UsersTableProps {
	users: UsersWithCounts;
	totalCollections: number;
	totalLinks: number;
}

export function UsersTable({
	users,
	totalCollections,
	totalLinks,
}: UsersTableProps) {
	const { t } = useTranslation();
	const [search, setSearch] = useState('');
	const [sortedData, setSortedData] = useState(users);
	const [sortBy, setSortBy] = useState<keyof UserWithCounts | null>(null);
	const [reverseSortDirection, setReverseSortDirection] = useState(false);

	const setSorting = (field: keyof UserWithCounts) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(users, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.currentTarget;
		setSearch(value);
		setSortedData(
			sortData(users, {
				sortBy: sortBy,
				reversed: reverseSortDirection,
				search: value,
			})
		);
	};

	const renderDateCell = (date: string) => (
		<Tooltip label={dayjs(date).format(DATE_FORMAT).toString()}>
			<Text>{dayjs(date).fromNow()}</Text>
		</Tooltip>
	);

	const rows = sortedData.map((user) => (
		<Table.Tr key={user.id}>
			<Table.Td>{user.fullname}</Table.Td>
			<Table.Td>
				{user.isAdmin ? (
					<Badge variant="light" color="red">
						{t('admin:admin')}
					</Badge>
				) : (
					<Badge variant="light" color="green">
						{t('admin:user')}
					</Badge>
				)}
			</Table.Td>
			<Table.Td>{user.collectionsCount}</Table.Td>
			<Table.Td>{user.linksCount}</Table.Td>
			<Table.Td>{renderDateCell(user.createdAt)}</Table.Td>
			<Table.Td>{renderDateCell(user.lastSeenAt)}</Table.Td>
		</Table.Tr>
	));

	return (
		<ScrollArea>
			<TextInput
				placeholder="Search by any field"
				mb="md"
				leftSection={<TbSearch style={{ width: rem(16), height: rem(16) }} />}
				value={search}
				onChange={handleSearchChange}
			/>
			<Table
				horizontalSpacing="md"
				verticalSpacing="xs"
				miw={700}
				layout="fixed"
			>
				<Table.Tbody>
					<Table.Tr>
						<Th
							sorted={sortBy === 'fullname'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('fullname')}
						>
							{t('common:name')}
						</Th>
						<Th
							sorted={sortBy === 'isAdmin'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('isAdmin')}
						>
							{t('admin:role')}
						</Th>
						<Th
							sorted={sortBy === 'collectionsCount'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('collectionsCount')}
						>
							{t('common:collection.collections')} ({totalCollections})
						</Th>
						<Th
							sorted={sortBy === 'linksCount'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('linksCount')}
						>
							{t('common:link.links')} ({totalLinks})
						</Th>
						<Th
							sorted={sortBy === 'createdAt'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('createdAt')}
						>
							{t('admin:created_at')}
						</Th>
						<Th
							sorted={sortBy === 'lastSeenAt'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('lastSeenAt')}
						>
							{t('admin:last_seen_at')}
						</Th>
					</Table.Tr>
				</Table.Tbody>
				<Table.Tbody>
					{rows.length > 0 ? (
						rows
					) : (
						<Table.Tr>
							<Table.Td colSpan={4}>
								<Text fw={500} ta="center">
									Nothing found
								</Text>
							</Table.Td>
						</Table.Tr>
					)}
				</Table.Tbody>
			</Table>
		</ScrollArea>
	);
}