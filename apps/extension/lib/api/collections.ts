import type { CollectionWithLinks } from '@/lib/api/types';
import { createExtensionApiClient } from '@/lib/api/client';

export class FetchCollectionsError extends Error {}

export async function fetchCollections(): Promise<CollectionWithLinks[]> {
	const client = await createExtensionApiClient();
	const { data: collectionsResponse, error } = await client.GET(
		'/api/v1/collections'
	);

	if (error) {
		throw new FetchCollectionsError(
			'Failed to fetch collections from the API.'
		);
	}

	return collectionsResponse.data;
}
