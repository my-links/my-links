import { fakeBrowser } from 'wxt/testing/fake-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { disconnectFromInstance } from '@/lib/api/auth';
import { apiTokenStorage, instanceUrlStorage } from '@/lib/storage';

const INSTANCE_URL = 'https://mylinks.example.com';
const TOKEN = 'secret-token';

let removePermission: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
	fakeBrowser.reset();
	removePermission = vi.fn().mockResolvedValue(true);
	Object.assign(browser.permissions, { remove: removePermission });
	fetchMock = vi.fn().mockResolvedValue({ status: 204 });
	vi.stubGlobal('fetch', fetchMock);
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	await instanceUrlStorage.setValue(INSTANCE_URL);
	await apiTokenStorage.setValue(TOKEN);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
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

		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
		expect(console.error).toHaveBeenCalledWith(
			'MyLinks could not release the instance permission',
			failure
		);
	});

	it('should revoke the token with a bearer DELETE', async () => {
		await disconnectFromInstance();

		expect(fetchMock).toHaveBeenCalledWith(
			`${INSTANCE_URL}/api/v1/tokens/current`,
			{ method: 'DELETE', headers: { Authorization: `Bearer ${TOKEN}` } }
		);
	});

	it('should stay quiet and finish disconnecting after a 401', async () => {
		fetchMock.mockResolvedValue({ status: 401 });

		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
		expect(console.error).not.toHaveBeenCalled();
	});

	it('should finish disconnecting and log once when the network fails', async () => {
		fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	it('should finish disconnecting and log once on another status', async () => {
		fetchMock.mockResolvedValue({ status: 500 });

		await disconnectFromInstance();

		expect(await apiTokenStorage.getValue()).toBeNull();
		expect(console.error).toHaveBeenCalledTimes(1);
	});

	it('should never log the token', async () => {
		fetchMock.mockResolvedValue({ status: 500 });

		await disconnectFromInstance();

		expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
			TOKEN
		);
	});

	it('should not call the instance when there is no token', async () => {
		await apiTokenStorage.setValue(null);

		await disconnectFromInstance();

		expect(fetchMock).not.toHaveBeenCalled();
	});
});
