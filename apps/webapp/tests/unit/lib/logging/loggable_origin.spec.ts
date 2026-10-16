import { test } from '@japa/runner';

import { toLoggableOrigin } from '#lib/logging/loggable_origin';

test.group('toLoggableOrigin', () => {
	test('should drop the path and the query string', ({ assert }) => {
		assert.equal(
			toLoggableOrigin('https://example.com/private/page?token=abc#frag'),
			'https://example.com'
		);
	});

	test('should keep a non-default port', ({ assert }) => {
		assert.equal(
			toLoggableOrigin('https://example.com:8443/page'),
			'https://example.com:8443'
		);
	});

	test('should drop credentials', ({ assert }) => {
		assert.equal(
			toLoggableOrigin('https://user:secret@example.com/'),
			'https://example.com'
		);
	});

	test('should not echo an unparsable url', ({ assert }) => {
		assert.notInclude(toLoggableOrigin('not a url /secret'), 'secret');
	});
});
