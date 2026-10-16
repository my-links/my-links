import createClient from 'openapi-fetch';

import type { paths } from '@/lib/api/schema';
import type { CollectionWithLinks } from '@/lib/api/types';

export class FetchAccountIdentityError extends Error {}

/**
 * No endpoint returns the current user, but the owned collections of an
 * account all carry its id as `authorId`. Scoped by instance because ids
 * only mean something within one instance.
 */
export function findAccountIdentity(
	instanceUrl: string,
	collections: CollectionWithLinks[]
): string | null {
	const ownedCollection = collections.find((collection) => collection.isOwner);
	if (!ownedCollection) {
		return null;
	}
	return `${instanceUrl}#${ownedCollection.authorId}`;
}

/**
 * Takes the token explicitly: it runs before the new session is stored, so
 * nothing can sync against stale data while the identity is being checked.
 */
export async function fetchAccountIdentity(
	instanceUrl: string,
	token: string
): Promise<string | null> {
	const client = createClient<paths>({
		baseUrl: instanceUrl,
		headers: { Authorization: `Bearer ${token}` },
	});
	const { data: collectionsResponse, error } = await client.GET(
		'/api/v1/collections'
	);

	if (error || !collectionsResponse) {
		throw new FetchAccountIdentityError(
			'Could not verify the connected account.'
		);
	}
	return findAccountIdentity(instanceUrl, collectionsResponse.data);
}
