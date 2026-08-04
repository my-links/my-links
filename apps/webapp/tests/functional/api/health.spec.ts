import { test } from '@japa/runner';

test.group('API health — unauthenticated response', () => {
	test('should not disclose the application version', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/api/v1/health');

		const body = response.body();
		assert.notProperty(body, 'version');
		assert.property(body, 'capabilities');
		assert.property(body, 'isHealthy');
	});
});
