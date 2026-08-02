import type { SearchResult } from '@/lib/api/types';
import { createExtensionApiClient } from '@/lib/api/client';

export class SearchError extends Error {}

/**
 * Collections are already browsable through the sidebar tree, so the panel
 * only ever searches links.
 */
const SEARCH_SCOPE = 'link';

export async function searchLinks(term: string): Promise<SearchResult[]> {
	const client = await createExtensionApiClient();
	const { data, error } = await client.GET('/api/v1/search', {
		params: { query: { term, type: SEARCH_SCOPE } },
	});

	if (error) {
		throw new SearchError('Failed to search MyLinks.');
	}

	return data.data;
}
