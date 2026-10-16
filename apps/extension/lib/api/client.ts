import createClient from 'openapi-fetch';

import type { paths } from '@/lib/api/schema';
import {
	apiTokenStorage,
	authInvalidStorage,
	instanceUrlStorage,
} from '@/lib/storage';

const HTTP_UNAUTHORIZED = 401;

export class MissingApiTokenError extends Error {}

/**
 * The instance URL and token can change (options page, logout), so the
 * client is rebuilt from current storage on every call rather than cached
 * as a module-level singleton: `createClient` itself is a cheap object,
 * not a connection. Throws without a token so an install that never
 * connected cannot reach the default instance.
 */
export async function createExtensionApiClient() {
	const [instanceUrl, token] = await Promise.all([
		instanceUrlStorage.getValue(),
		apiTokenStorage.getValue(),
	]);

	if (!token) {
		throw new MissingApiTokenError('No API token: connect an instance first.');
	}

	const client = createClient<paths>({ baseUrl: instanceUrl });

	client.use({
		onRequest({ request }) {
			request.headers.set('Authorization', `Bearer ${token}`);
			return request;
		},
		async onResponse({ response }) {
			if (response.status === HTTP_UNAUTHORIZED) {
				await authInvalidStorage.setValue(true);
			}
			return response;
		},
	});

	return client;
}
