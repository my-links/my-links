import { UserWithCounters } from '#shared/types/dto';

export function filterData(data: UserWithCounters[], search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) =>
		['email', 'fullname'].some((key) => {
			const value = item[key as keyof UserWithCounters];
			return typeof value === 'string' && value.toLowerCase().includes(query);
		})
	);
}

export function sortData(
	data: UserWithCounters[],
	payload: {
		sortBy: keyof UserWithCounters | null;
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
			if (!a[sortBy] || !b[sortBy]) return 0;
			if (payload.reversed) {
				return b[sortBy] > a[sortBy] ? 1 : -1;
			}
			return a[sortBy] > b[sortBy] ? 1 : -1;
		}),
		payload.search
	);
}
