import createClient from 'openapi-fetch';

import type { paths } from '@/lib/api/schema';

export class FetchAccountIdentityError extends Error {}

/**
 * Takes the token explicitly: it runs before the new session is stored, so
 * nothing can sync against stale data while the identity is being checked.
 * Scoped by instance because user ids only mean something within one instance.
 */
export async function fetchAccountIdentity(
	instanceUrl: string,
	token: string
): Promise<string> {
	const client = createClient<paths>({
		baseUrl: instanceUrl,
		headers: { Authorization: `Bearer ${token}` },
	});
	const { data: tokenCheck, error } = await client.GET('/api/v1/tokens/check');

	if (error || !tokenCheck) {
		throw new FetchAccountIdentityError(
			'Could not verify the connected account.'
		);
	}
	return `${instanceUrl}#${tokenCheck.userId}`;
}
