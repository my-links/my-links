import { describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

import { subscribeToQueryData } from '@/lib/query/subscribe_to_query_data';

const SUBSCRIBED_KEY = ['subscribed'] as const;
const OTHER_KEY = ['other'] as const;

describe('subscribeToQueryData', () => {
	it('should call onChange synchronously when the subscribed key is written', () => {
		const queryClient = new QueryClient();
		const onChange = vi.fn();
		subscribeToQueryData(queryClient, SUBSCRIBED_KEY, onChange);

		queryClient.setQueryData(SUBSCRIBED_KEY, [1]);

		expect(onChange).toHaveBeenCalled();
	});

	it('should not call onChange when another key is written', () => {
		const queryClient = new QueryClient();
		const onChange = vi.fn();
		subscribeToQueryData(queryClient, SUBSCRIBED_KEY, onChange);

		queryClient.setQueryData(OTHER_KEY, [1]);

		expect(onChange).not.toHaveBeenCalled();
	});

	it('should stop calling onChange when unsubscribed', () => {
		const queryClient = new QueryClient();
		const onChange = vi.fn();
		const unsubscribe = subscribeToQueryData(
			queryClient,
			SUBSCRIBED_KEY,
			onChange
		);
		unsubscribe();

		queryClient.setQueryData(SUBSCRIBED_KEY, [1]);

		expect(onChange).not.toHaveBeenCalled();
	});
});
