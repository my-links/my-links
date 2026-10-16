import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	FetchAccountIdentityError,
	fetchAccountIdentity,
} from '@/lib/api/account_identity';

const INSTANCE_URL = 'https://mylinks.example.com';
const TOKEN = 'secret-token';

function stubFetchResponse(status: number, body: object) {
	const fetchMock = vi.fn().mockResolvedValue(
		new Response(JSON.stringify(body), {
			status,
			headers: { 'content-type': 'application/json' },
		})
	);
	vi.stubGlobal('fetch', fetchMock);
	return fetchMock;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('fetchAccountIdentity', () => {
	it('should scope the token owner id by instance', async () => {
		stubFetchResponse(200, { message: 'ok', userId: 7 });

		await expect(fetchAccountIdentity(INSTANCE_URL, TOKEN)).resolves.toBe(
			`${INSTANCE_URL}#7`
		);
	});

	it('should ask the token check endpoint with the given token', async () => {
		const fetchMock = stubFetchResponse(200, { message: 'ok', userId: 7 });

		await fetchAccountIdentity(INSTANCE_URL, TOKEN);

		const [request] = fetchMock.mock.calls[0] as [Request];
		expect(request.url).toBe(`${INSTANCE_URL}/api/v1/tokens/check`);
		expect(request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
	});

	it('should throw when the instance rejects the token', async () => {
		stubFetchResponse(401, { message: 'Unauthorized' });

		await expect(fetchAccountIdentity(INSTANCE_URL, TOKEN)).rejects.toThrow(
			FetchAccountIdentityError
		);
	});
});
