import { fakeBrowser } from 'wxt/testing/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { disconnectFromInstance } from '@/lib/api/auth';
import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';

const INSTANCE_URL = 'https://mylinks.example.com';

let removePermission: ReturnType<typeof vi.fn>;

beforeEach(async () => {
	fakeBrowser.reset();
	removePermission = vi.fn().mockResolvedValue(true);
	Object.assign(browser.permissions, { remove: removePermission });
	await instanceUrlStorage.setValue(INSTANCE_URL);
	await apiTokenStorage.setValue('secret-token');
});

describe('disconnectFromInstance', () => {
	it('should remove the origin permissions requested on connect', async () => {
		await disconnectFromInstance();

		expect(removePermission).toHaveBeenCalledWith({
			origins: [`${INSTANCE_URL}/*`, 'https://www.mylinks.example.com/*'],
		});
	});

	it('should clear the stored token', async () => {
		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
	});

	it('should still clear the session and log when removing the permission fails', async () => {
		const failure = new Error('cannot remove');
		removePermission.mockRejectedValue(failure);
		const consoleError = vi
			.spyOn(console, 'error')
			.mockImplementation(() => undefined);

		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
		expect(consoleError).toHaveBeenCalledWith(
			'MyLinks could not release the instance permission',
			failure
		);
	});
});
