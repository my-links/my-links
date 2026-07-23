import { describe, expect, it } from 'vitest';

import {
	extractTokenFromAuthCallback,
	normalizeInstanceUrl,
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
