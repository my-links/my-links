import { test } from '@japa/runner';

const SERVER_TIMING_PATTERN = /^app;dur=\d+\.\d$/;

test.group('Server-Timing header', () => {
	test('should report server time when a route responds', async ({
		assert,
		client,
	}) => {
		const response = await client.get('/api/v1/health');

		assert.match(
			String(response.header('server-timing')),
			SERVER_TIMING_PATTERN
		);
	});

	test('should report server time when no route matches', async ({
		assert,
		client,
	}) => {
		const response = await client.get('/this-route-does-not-exist');

		assert.match(
			String(response.header('server-timing')),
			SERVER_TIMING_PATTERN
		);
	});
});
