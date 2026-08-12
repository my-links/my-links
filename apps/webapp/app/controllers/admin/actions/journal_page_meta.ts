type PaginatorMeta = {
	getMeta(): {
		currentPage: number | string;
		lastPage: number | string;
		total: number | string;
	};
};

/**
 * Both journal controllers convert the same three paginator fields to
 * numbers for their Inertia props.
 */
export function journalPageMeta(paginator: PaginatorMeta): {
	currentPage: number;
	lastPage: number;
	totalEvents: number;
} {
	const { currentPage, lastPage, total } = paginator.getMeta();

	return {
		currentPage: Number(currentPage),
		lastPage: Number(lastPage),
		totalEvents: Number(total),
	};
}
