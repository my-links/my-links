import { createExtensionApiClient } from '@/lib/api/client';
import type {
	CollectionVisibility,
	CollectionWithLinks,
} from '@/lib/api/types';

export class FetchCollectionsError extends Error {}
export class CreateCollectionError extends Error {}
export class UpdateCollectionError extends Error {}
export class DeleteCollectionError extends Error {}

export interface CollectionInput {
	name: string;
	description: string | null;
	visibility: CollectionVisibility;
	icon?: string | null;
}

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
