import type { LinkResource } from '@/lib/api/types';
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

/**
 * Returns the created link: the bookmark mirror adopts an existing native
 * node into a new link, and needs the server's id straight away to record
 * the mapping. Without it the node stays unmapped and every later pass
 * adopts it again, creating a duplicate link each time.
 */
export async function createLink(
	input: CreateLinkInput
): Promise<LinkResource> {
	const client = await createExtensionApiClient();
	const { data, error } = await client.POST('/api/v1/links', { body: input });

	if (error) {
		throw new CreateLinkError('Failed to create the link.');
	}

	return data.link;
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
