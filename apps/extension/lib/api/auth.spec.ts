import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	ExtensionAuthError,
	extractTokenFromAuthCallback,
	normalizeInstanceUrl,
	resolveCanonicalOrigin,
} from '@/lib/api/auth';

describe('normalizeInstanceUrl', () => {
	it('should strip a trailing path down to the origin', () => {
		expect(normalizeInstanceUrl('https://mylinks.example.com/some/path')).toBe(
			'https://mylinks.example.com'
		);
	});

	it('should strip surrounding whitespace before parsing', () => {
		expect(normalizeInstanceUrl('  https://mylinks.example.com  ')).toBe(
			'https://mylinks.example.com'
		);
	});

	it('should preserve a non-default port', () => {
		expect(normalizeInstanceUrl('http://localhost:3333/')).toBe(
			'http://localhost:3333'
		);
	});

	it('should throw when the input is not a valid URL', () => {
		expect(() => normalizeInstanceUrl('not-a-url')).toThrow();
	});
});

describe('resolveCanonicalOrigin', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should return the typed origin when it answers directly', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({}));

		await expect(
			resolveCanonicalOrigin('https://mylinks.example.com')
		).resolves.toBe('https://mylinks.example.com');
	});

	it('should fall back to the www sibling when the typed origin redirects', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockImplementation((input: string) =>
					input.startsWith('https://www.')
						? Promise.resolve({})
						: Promise.reject(new TypeError('Failed to fetch'))
				)
		);

		await expect(
			resolveCanonicalOrigin('https://mylinks.example.com')
		).resolves.toBe('https://www.mylinks.example.com');
	});

	it('should not retry a www origin that already redirects', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
		);

		await expect(
			resolveCanonicalOrigin('https://www.mylinks.example.com')
		).rejects.toThrow(ExtensionAuthError);
		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it('should throw an ExtensionAuthError when neither origin answers', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
		);

		await expect(
			resolveCanonicalOrigin('https://mylinks.example.com')
		).rejects.toThrow(ExtensionAuthError);
	});
});

describe('extractTokenFromAuthCallback', () => {
	it('should read the token from the callback URL fragment', () => {
		const callbackUrl =
			'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/#token=secret-token-value';

		expect(extractTokenFromAuthCallback(callbackUrl)).toBe(
			'secret-token-value'
		);
	});

	it('should url-decode the token value', () => {
		const callbackUrl =
			'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/#token=a%2Bb%2Fc';

		expect(extractTokenFromAuthCallback(callbackUrl)).toBe('a+b/c');
	});

	it('should return null when there is no fragment', () => {
		const callbackUrl =
			'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/';

		expect(extractTokenFromAuthCallback(callbackUrl)).toBeNull();
	});

	it('should return null when the fragment has no token key', () => {
		const callbackUrl =
			'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/#error=access_denied';

		expect(extractTokenFromAuthCallback(callbackUrl)).toBeNull();
	});
});
