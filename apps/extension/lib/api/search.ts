import type { SearchResult } from '@/lib/api/types';
import { createExtensionApiClient } from '@/lib/api/client';

export class SearchError extends Error {}

export async function searchLinksAndCollections(
	term: string
): Promise<SearchResult[]> {
	const client = await createExtensionApiClient();
	const { data, error } = await client.GET('/api/v1/search', {
		params: { query: { term } },
	});

	if (error) {
		throw new SearchError('Failed to search MyLinks.');
	}

	return data.data;
}
