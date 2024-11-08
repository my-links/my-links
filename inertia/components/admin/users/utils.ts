import {
	UsersWithCounts,
	UserWithCounts,
} from '~/components/admin/users/users_table';

export function filterData(data: UsersWithCounts, search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) =>
		['email', 'name', 'nickName', 'fullname'].some((key) => {
			const value = item[key as keyof UserWithCounts];
			return typeof value === 'string' && value.toLowerCase().includes(query);
		})
	);
}

export function sortData(
	data: UsersWithCounts,
	payload: {
		sortBy: keyof UserWithCounts | null;
		reversed: boolean;
		search: string;
	}
) {
	const { sortBy } = payload;

	if (!sortBy) {
		return filterData(data, payload.search);
	}

	return filterData(
		[...data].sort((a, b) => {
			if (payload.reversed) {
				return b[sortBy] > a[sortBy] ? 1 : -1;
			}
			return a[sortBy] > b[sortBy] ? 1 : -1;
		}),
		payload.search
	);
}
