import { test } from '@japa/runner';

import {
	isSlowRequest,
	SLOW_REQUEST_THRESHOLD_MS,
} from '#middleware/request_timing_middleware';

test.group('Request timing: slow request threshold', () => {
	test('should not flag a request when it is below the threshold', ({
		assert,
	}) => {
		assert.isFalse(isSlowRequest(SLOW_REQUEST_THRESHOLD_MS - 0.1));
	});

	test('should flag a request when it lasts exactly the threshold', ({
		assert,
	}) => {
		assert.isTrue(isSlowRequest(SLOW_REQUEST_THRESHOLD_MS));
	});

	test('should flag a request when it is above the threshold', ({ assert }) => {
		assert.isTrue(isSlowRequest(SLOW_REQUEST_THRESHOLD_MS + 0.1));
	});
});
