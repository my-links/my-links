import { test } from '@japa/runner';

import {
	isBlockedStatus,
	isRetryableNetworkError,
} from '#lib/favicons/block_detection';

test.group('isBlockedStatus', () => {
	test('should treat {status} as a block signal')
		.with([401, 403, 406, 429])
		.run(({ assert }, status) => {
			assert.isTrue(isBlockedStatus(status));
		});

	test('should not treat {status} as a block signal')
		.with([200, 301, 304, 404, 500, 503])
		.run(({ assert }, status) => {
			assert.isFalse(isBlockedStatus(status));
		});
});

test.group('isRetryableNetworkError', () => {
	test('should retry when the undici cause reports a header overflow', ({
		assert,
	}) => {
		const error = new TypeError('fetch failed', {
			cause: { code: 'UND_ERR_HEADERS_OVERFLOW' },
		});

		assert.isTrue(isRetryableNetworkError(error));
	});

	test('should not retry on an unknown cause code', ({ assert }) => {
		const error = new TypeError('fetch failed', {
			cause: { code: 'ENOTFOUND' },
		});

		assert.isFalse(isRetryableNetworkError(error));
	});

	test('should not retry when the error has no cause', ({ assert }) => {
		assert.isFalse(isRetryableNetworkError(new Error('boom')));
	});

	test('should not retry on a non-error value', ({ assert }) => {
		assert.isFalse(isRetryableNetworkError('UND_ERR_HEADERS_OVERFLOW'));
	});
});
