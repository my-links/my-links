import createClient from 'openapi-fetch';

import type { paths } from '@/lib/api/schema';
import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';

/**
 * The instance URL and token can change (options page, logout), so the
 * client is rebuilt from current storage on every call rather than cached
 * as a module-level singleton — `createClient` itself is a cheap object,
 * not a connection.
 */
export async function createExtensionApiClient() {
	const [instanceUrl, token] = await Promise.all([
		instanceUrlStorage.getValue(),
		apiTokenStorage.getValue(),
	]);

	const client = createClient<paths>({ baseUrl: instanceUrl });

	client.use({
		onRequest({ request }) {
			if (token) {
				request.headers.set('Authorization', `Bearer ${token}`);
			}
			return request;
		},
	});

	return client;
}
