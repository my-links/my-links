import { Data } from '@generated/data';
import { useCallback, useMemo, useState } from 'react';
import { sortData } from '~/components/admin/users/utils';

type UserWithCounters = Data.User.Variants['withCounters'];

type SortBy = keyof UserWithCounters;

const DEFAULT_SORT_BY: SortBy = 'lastSeenAt';
const DEFAULT_SORT_DIRECTION = true;

export function useUsersSorting(users: UserWithCounters[]) {
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState<SortBy>(DEFAULT_SORT_BY);
	const [reverseSortDirection, setReverseSortDirection] = useState(
		DEFAULT_SORT_DIRECTION
	);

	const sortedData = useMemo(
		() =>
			sortData(users, {
				sortBy,
				reversed: reverseSortDirection,
				search,
			}),
		[users, sortBy, reverseSortDirection, search]
	);

	const setSorting = useCallback(
		(field: SortBy) => {
			const reversed = field === sortBy ? !reverseSortDirection : false;
			setReverseSortDirection(reversed);
			setSortBy(field);
		},
		[sortBy, reverseSortDirection]
	);

	return {
		search,
		setSearch,
		sortBy,
		reverseSortDirection,
		setSorting,
		sortedData,
	};
}
