import { createExtensionApiClient } from '@/lib/api/client';
import type {
	CollectionVisibility,
	CollectionWithLinks,
	FollowedCollectionWithLinks,
} from '@/lib/api/types';

export class FetchCollectionsError extends Error {}
export class CreateCollectionError extends Error {}
export class UpdateCollectionError extends Error {}
export class DeleteCollectionError extends Error {}
export class ReorderCollectionsError extends Error {}
export class ReorderCollectionLinksError extends Error {}

/**
 * The instance rejected the API token (deleted or expired) — distinct from a
 * generic fetch failure so the sync layer can prompt for a reconnect instead
 * of silently backing off as if the server were merely unreachable.
 */
export class UnauthorizedApiError extends Error {}

const HTTP_UNAUTHORIZED = 401;

export interface CollectionInput {
	name: string;
	description: string | null;
	visibility: CollectionVisibility;
	icon?: string | null;
}

export interface FetchedCollections {
	collections: CollectionWithLinks[];
	followedCollections: FollowedCollectionWithLinks[];
}

export async function fetchCollections(): Promise<FetchedCollections> {
	const client = await createExtensionApiClient();
	const {
		data: collectionsResponse,
		error,
		response,
	} = await client.GET('/api/v1/collections');

	// Checked before `error` because the OpenAPI spec declares no error
	// responses, so TypeScript narrows `response` to `never` inside an
	// `if (error)` block even though 401s happen at runtime.
	if (response.status === HTTP_UNAUTHORIZED) {
		throw new UnauthorizedApiError('The API token is invalid or expired.');
	}

	if (error) {
		throw new FetchCollectionsError(
			'Failed to fetch collections from the API.'
		);
	}

	return {
		collections: collectionsResponse.data,
		followedCollections: collectionsResponse.followedCollections,
	};
}

export async function createCollection(
	input: CollectionInput
): Promise<CollectionWithLinks> {
	const client = await createExtensionApiClient();
	const { data, error } = await client.POST('/api/v1/collections', {
		body: input,
	});

	if (error) {
		throw new CreateCollectionError('Failed to create the collection.');
	}

	return data.collection;
}

export async function updateCollection(
	collectionId: number,
	input: CollectionInput
): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.PUT('/api/v1/collections/{id}', {
		params: { path: { id: collectionId } },
		body: input,
	});

	if (error) {
		throw new UpdateCollectionError('Failed to update the collection.');
	}
}

export async function deleteCollection(collectionId: number): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.DELETE('/api/v1/collections/{id}', {
		params: { path: { id: collectionId } },
	});

	if (error) {
		throw new DeleteCollectionError('Failed to delete the collection.');
	}
}

export async function reorderCollections(
	visibility: CollectionVisibility,
	collectionIds: number[]
): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.PUT('/api/v1/collections/owned/reorder', {
		body: { visibility, collectionIds },
	});

	if (error) {
		throw new ReorderCollectionsError('Failed to reorder collections.');
	}
}

export async function reorderCollectionLinks(
	collectionId: number,
	linkIds: number[]
): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.PUT('/api/v1/collections/{id}/links/reorder', {
		params: { path: { id: collectionId } },
		body: { linkIds },
	});

	if (error) {
		throw new ReorderCollectionLinksError('Failed to reorder links.');
	}
}
