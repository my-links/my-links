import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';

import { subscribeToQueryData } from '@/lib/query/subscribe_to_query_data';

/**
 * Cache writes made inside a dnd-kit `onDragEnd` must render in dnd-kit's own
 * commit, which `useQuery`'s setTimeout-scheduled notifications miss.
 */
export function useQueryDataSnapshot<TData>(
	queryKey: QueryKey
): TData | undefined {
	const queryClient = useQueryClient();

	const subscribe = useCallback(
		(onChange: () => void) =>
			subscribeToQueryData(queryClient, queryKey, onChange),
		[queryClient, queryKey]
	);

	return useSyncExternalStore(subscribe, () =>
		queryClient.getQueryData<TData>(queryKey)
	);
}
