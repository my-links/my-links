import { fakeBrowser } from 'wxt/testing/fake-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	createExtensionApiClient,
	MissingApiTokenError,
} from '@/lib/api/client';
import {
	apiTokenStorage,
	authInvalidStorage,
	instanceUrlStorage,
} from '@/lib/storage';

beforeEach(() => {
	fakeBrowser.reset();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('createExtensionApiClient', () => {
	it('should throw when no token is stored', async () => {
		await expect(createExtensionApiClient()).rejects.toBeInstanceOf(
			MissingApiTokenError
		);
	});

	it('should create a client when a token is stored', async () => {
		await apiTokenStorage.setValue('test-token');

		await expect(createExtensionApiClient()).resolves.toBeDefined();
	});

	describe('with a stored session', () => {
		beforeEach(async () => {
			await instanceUrlStorage.setValue('https://mylinks.example.com');
			await apiTokenStorage.setValue('secret-token-value');
		});

		it('should flag the token as invalid when any call is rejected with 401', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
			);
			const client = await createExtensionApiClient();

			await client.GET('/api/v1/collections');

			expect(await authInvalidStorage.getValue()).toBe(true);
		});

		it('should leave the token valid when a call succeeds', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockResolvedValue(
					new Response(JSON.stringify({}), {
						status: 200,
						headers: { 'content-type': 'application/json' },
					})
				)
			);
			const client = await createExtensionApiClient();

			await client.GET('/api/v1/collections');

			expect(await authInvalidStorage.getValue()).toBe(false);
		});
	});
});
