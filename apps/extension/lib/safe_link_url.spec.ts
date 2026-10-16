import { describe, expect, it } from 'vitest';

import { isSafeLinkUrl, toSafeHref } from '@/lib/safe_link_url';

describe('isSafeLinkUrl', () => {
	it.each([
		'https://example.com/path?q=1',
		'http://example.com',
		'HTTPS://EXAMPLE.COM',
	])('should accept %s', (url) => {
		expect(isSafeLinkUrl(url)).toBe(true);
	});

	it.each([
		'javascript:alert(1)',
		' javascript:alert(1)',
		'JaVaScRiPt:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'file:///etc/passwd',
		'chrome://settings',
		'about:blank',
		'ftp://example.com',
		'not a url',
		'/relative/path',
		'',
	])('should reject %s', (url) => {
		expect(isSafeLinkUrl(url)).toBe(false);
	});
});

describe('toSafeHref', () => {
	it('should return the URL when it is safe', () => {
		expect(toSafeHref('https://example.com')).toBe('https://example.com');
	});

	it('should return undefined when it is not safe', () => {
		expect(toSafeHref('javascript:alert(1)')).toBeUndefined();
	});
});
