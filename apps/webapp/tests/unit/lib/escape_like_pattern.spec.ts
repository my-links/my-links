import { test } from '@japa/runner';

import { escapeLikePattern } from '#lib/escape_like_pattern';

test.group('escapeLikePattern', () => {
	test('should escape a percent sign', ({ assert }) => {
		assert.equal(escapeLikePattern('50%'), '50\\%');
	});

	test('should escape an underscore', ({ assert }) => {
		assert.equal(escapeLikePattern('a_b'), 'a\\_b');
	});

	test('should escape a backslash', ({ assert }) => {
		assert.equal(escapeLikePattern('a\\b'), 'a\\\\b');
	});

	test('should leave an ordinary term untouched', ({ assert }) => {
		assert.equal(escapeLikePattern('plain term'), 'plain term');
	});
});
