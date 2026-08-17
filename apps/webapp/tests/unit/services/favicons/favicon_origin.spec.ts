import { test } from '@japa/runner';

import { normalizeFaviconOrigin } from '#services/favicons/favicon_origin';

test.group('normalizeFaviconOrigin', () => {
	test('should drop the pathname, query string, and fragment', ({ assert }) => {
		assert.equal(
			normalizeFaviconOrigin('https://example.com/some/deep/page?a=1#section'),
			'https://example.com'
		);
	});

	test('should lowercase the hostname', ({ assert }) => {
		assert.equal(
			normalizeFaviconOrigin('https://Example.COM/'),
			'https://example.com'
		);
	});

	test('should treat two different paths on the same origin as equal', ({
		assert,
	}) => {
		assert.equal(
			normalizeFaviconOrigin('https://example.com/a'),
			normalizeFaviconOrigin('https://example.com/b')
		);
	});

	test('should treat different hostnames as different origins', ({
		assert,
	}) => {
		assert.notEqual(
			normalizeFaviconOrigin('https://example.com/'),
			normalizeFaviconOrigin('https://sub.example.com/')
		);
	});

	test('should lowercase an unparsable URL rather than throw', ({ assert }) => {
		assert.equal(normalizeFaviconOrigin('NOT-A-URL'), 'not-a-url');
	});
});
