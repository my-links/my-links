import { test } from '@japa/runner';

import {
	MAX_SUMMARY_LENGTH,
	labelCandidate,
	describeFailure,
	summarizeAttempts,
} from '#lib/favicons/failure_summary';

test.group('describeFailure', () => {
	test('should report a timeout error as timeout', ({ assert }) => {
		const error = new DOMException('timed out', 'TimeoutError');

		assert.equal(describeFailure(error), 'timeout');
	});

	test('should report the undici cause code for a fetch failure', ({
		assert,
	}) => {
		const error = new TypeError('fetch failed', {
			cause: { code: 'ENOTFOUND' },
		});

		assert.equal(describeFailure(error), 'ENOTFOUND');
	});

	test('should fall back to the error message', ({ assert }) => {
		assert.equal(describeFailure(new Error('HTTP 403')), 'HTTP 403');
	});

	test('should stringify a non-error value', ({ assert }) => {
		assert.equal(describeFailure('boom'), 'boom');
	});
});

test.group('labelCandidate', () => {
	test('should label an http candidate by its path', ({ assert }) => {
		assert.equal(
			labelCandidate('https://example.com/img/logo.png?v=2'),
			'/img/logo.png'
		);
	});

	test('should label an inline image without dumping its payload', ({
		assert,
	}) => {
		assert.equal(labelCandidate('data:image/svg+xml,<svg></svg>'), 'data URI');
	});

	test('should keep an unparseable url short', ({ assert }) => {
		assert.isAtMost(labelCandidate('x'.repeat(300)).length, 60);
	});
});

test.group('summarizeAttempts', () => {
	test('should join the attempts in order', ({ assert }) => {
		assert.equal(
			summarizeAttempts(['document: 403', '/favicon.ico: 403']),
			'document: 403; /favicon.ico: 403'
		);
	});

	test('should collapse attempts beyond the listing limit', ({ assert }) => {
		const attempts = Array.from({ length: 9 }, (_, index) => `a${index}: x`);

		assert.match(summarizeAttempts(attempts), /; \+3 more$/);
	});

	test('should truncate to the maximum summary length', ({ assert }) => {
		const summary = summarizeAttempts(['y'.repeat(MAX_SUMMARY_LENGTH * 2)]);

		assert.lengthOf(summary, MAX_SUMMARY_LENGTH);
	});

	test('should explain when there were no attempts at all', ({ assert }) => {
		assert.equal(summarizeAttempts([]), 'no favicon candidates');
	});
});
