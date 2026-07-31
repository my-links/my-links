import { test } from '@japa/runner';

import { toIsoTimestamp } from '#lib/database/aggregate_timestamp';

const ISO_TIMESTAMP = '2026-07-31T10:20:30.000Z';

test.group('toIsoTimestamp', () => {
	test('should render a driver date as an ISO string', ({ assert }) => {
		assert.equal(toIsoTimestamp(new Date(ISO_TIMESTAMP)), ISO_TIMESTAMP);
	});

	test('should keep a timestamp the driver already handed back as text', ({
		assert,
	}) => {
		assert.equal(toIsoTimestamp(ISO_TIMESTAMP), ISO_TIMESTAMP);
	});

	test('should read a missing aggregate as no value', ({ assert }) => {
		assert.isNull(toIsoTimestamp(undefined));
	});

	test('should read an aggregate over no rows as no value', ({ assert }) => {
		assert.isNull(toIsoTimestamp(null));
	});
});
