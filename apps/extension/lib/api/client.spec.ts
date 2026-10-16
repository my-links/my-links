import { fakeBrowser } from 'wxt/testing/fake-browser';
import { beforeEach, describe, expect, it } from 'vitest';

import { apiTokenStorage } from '@/lib/storage';
import {
	createExtensionApiClient,
	MissingApiTokenError,
} from '@/lib/api/client';

beforeEach(() => {
	fakeBrowser.reset();
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
});
