import {
	hashKey,
	type QueryClient,
	type QueryKey,
} from '@tanstack/react-query';

export function subscribeToQueryData(
	queryClient: QueryClient,
	queryKey: QueryKey,
	onChange: () => void
): () => void {
	const queryHash = hashKey(queryKey);

	return queryClient.getQueryCache().subscribe((event) => {
		if (event.query.queryHash === queryHash) {
			onChange();
		}
	});
}
