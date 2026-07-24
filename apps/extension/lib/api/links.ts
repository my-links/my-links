import { createExtensionApiClient } from '@/lib/api/client';

export class CreateLinkError extends Error {}
export class UpdateLinkError extends Error {}
export class DeleteLinkError extends Error {}

export interface CreateLinkInput {
	name: string;
	url: string;
	description?: string | null;
	favorite: boolean;
	collectionIds?: number[];
}

export interface UpdateLinkInput {
	name: string;
	url: string;
	description?: string | null;
	favorite: boolean;
	collectionIds: number[];
}

export async function createLink(input: CreateLinkInput): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.POST('/api/v1/links', { body: input });

	if (error) {
		throw new CreateLinkError('Failed to create the link.');
	}
}

export async function updateLink(
	linkId: number,
	input: UpdateLinkInput
): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.PUT('/api/v1/links/{id}', {
		params: { path: { id: linkId } },
		body: input,
	});

	if (error) {
		throw new UpdateLinkError('Failed to update the link.');
	}
}

export async function deleteLink(linkId: number): Promise<void> {
	const client = await createExtensionApiClient();
	const { error } = await client.DELETE('/api/v1/links/{id}', {
		params: { path: { id: linkId } },
	});

	if (error) {
		throw new DeleteLinkError('Failed to delete the link.');
	}
}
