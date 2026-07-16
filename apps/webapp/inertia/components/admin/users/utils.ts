import type { Data } from '@generated/data';

type UserWithCounters = Data.User.Variants['withCounters'];

export function filterData(data: UserWithCounters[], search: string) {
	const query = search.toLowerCase().trim();
	return data.filter((item) =>
		['email', 'fullname'].some((key) => {
			const value = item[key as keyof UserWithCounters];
			return typeof value === 'string' && value.toLowerCase().includes(query);
		})
	);
}

/**
 * Compare two values according to their type for sorting
 */
function compareValues(a: any, b: any, reversed: boolean): number {
	// Handle null/undefined values
	if (a === null && b === null) return 0;
	if (a === null) return 1;
	if (b === null) return -1;

	// Numeric sorting for counters
	if (typeof a === 'number' && typeof b === 'number') {
		return reversed ? b - a : a - b;
	}

	// Boolean sorting
	if (typeof a === 'boolean' && typeof b === 'boolean') {
		if (a === b) return 0;
		return reversed ? (b ? 1 : -1) : a ? 1 : -1;
	}

	// Date sorting (ISO strings)
	if (typeof a === 'string' && typeof b === 'string') {
		// Check if they are ISO dates
		const dateA = new Date(a).getTime();
		const dateB = new Date(b).getTime();
		if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
			return reversed ? dateB - dateA : dateA - dateB;
		}

		// Otherwise, alphabetical sorting
		return reversed ? b.localeCompare(a) : a.localeCompare(b);
	}

	// Fallback : generic comparison
	return reversed ? (b > a ? 1 : -1) : a > b ? 1 : -1;
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
			const valueA = a[sortBy];
			const valueB = b[sortBy];
			return compareValues(valueA, valueB, payload.reversed);
		}),
		payload.search
	);
}
