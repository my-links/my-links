import { UserWithCounters } from '#shared/types/dto';
import {
	ScrollArea,
	Table,
	Text,
	TextInput,
	Tooltip,
	rem,
} from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ChangeEvent, useState } from 'react';
import { Th } from '~/components/admin/users/th';
import { sortData } from '~/components/admin/users/utils';
import { UserBadgeRole } from '~/components/common/user_badge_role';
import { DATE_FORMAT } from '~/constants';
import { Trans } from '@lingui/react/macro';

dayjs.extend(relativeTime);

export type Columns = keyof UserWithCounters;

const DEFAULT_SORT_BY: Columns = 'lastSeenAt';
const DEFAULT_SORT_DIRECTION = true;

export interface UsersTableProps {
	users: UserWithCounters[];
	totalCollections: number;
	totalLinks: number;
}

export function UsersTable({
	users,
	totalCollections,
	totalLinks,
}: UsersTableProps) {
	const [search, setSearch] = useState<string>('');
	const [sortBy, setSortBy] = useState<Columns | null>(DEFAULT_SORT_BY);
	const [reverseSortDirection, setReverseSortDirection] = useState(
		DEFAULT_SORT_DIRECTION
	);
	const [sortedData, setSortedData] = useState(() =>
		sortData(users, {
			sortBy: sortBy,
			reversed: reverseSortDirection,
			search: '',
		})
	);

	const setSorting = (field: keyof UserWithCounters) => {
		const reversed = field === sortBy ? !reverseSortDirection : false;
		setReverseSortDirection(reversed);
		setSortBy(field);
		setSortedData(sortData(users, { sortBy: field, reversed, search }));
	};

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
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

	const renderDateCell = (date: string | null) => {
		if (!date) return '-';
		return (
			<Tooltip label={dayjs(date).format(DATE_FORMAT).toString()}>
				<Text>{dayjs(date).fromNow()}</Text>
			</Tooltip>
		);
	};

	const rows = sortedData.map((user) => (
		<Table.Tr key={user.id}>
			<Table.Td>{user.fullname}</Table.Td>
			<Table.Td>
				<UserBadgeRole user={user} />
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
				placeholder={`Search by any field (${users.length} users)`}
				mb="md"
				leftSection={
					<div
						className="i-tabler-search"
						style={{ width: rem(16), height: rem(16) }}
					/>
				}
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
							<Trans>Name</Trans>
						</Th>
						<Th
							sorted={sortBy === 'isAdmin'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('isAdmin')}
						>
							<Trans>Role</Trans>
						</Th>
						<Th
							sorted={sortBy === 'collectionsCount'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('collectionsCount')}
						>
							<Trans>Collections</Trans> ({totalCollections})
						</Th>
						<Th
							sorted={sortBy === 'linksCount'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('linksCount')}
						>
							<Trans>Links</Trans> ({totalLinks})
						</Th>
						<Th
							sorted={sortBy === 'createdAt'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('createdAt')}
						>
							<Trans>Created at</Trans>
						</Th>
						<Th
							sorted={sortBy === 'lastSeenAt'}
							reversed={reverseSortDirection}
							onSort={() => setSorting('lastSeenAt')}
						>
							<Trans>Last seen at</Trans>
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
