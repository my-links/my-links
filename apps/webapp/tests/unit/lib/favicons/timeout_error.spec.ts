import { test } from '@japa/runner';

import { isTimeoutError } from '#lib/favicons/timeout_error';

test.group('isTimeoutError', () => {
	test('should recognize the TimeoutError raised by AbortSignal.timeout', ({
		assert,
	}) => {
		const error = new DOMException('timed out', 'TimeoutError');

		assert.isTrue(isTimeoutError(error));
	});

	test('should recognize an AbortError', ({ assert }) => {
		const error = new DOMException('aborted', 'AbortError');

		assert.isTrue(isTimeoutError(error));
	});

	test('should reject an unrelated error', ({ assert }) => {
		assert.isFalse(isTimeoutError(new Error('boom')));
	});

	test('should reject a non-error value', ({ assert }) => {
		assert.isFalse(isTimeoutError('TimeoutError'));
	});
});
