import { test } from '@japa/runner';

const FIREFOX_ORIGIN = 'moz-extension://3f2504e0-4f89-11d3-9a0c-0305e82c3301';
const ALLOW_ORIGIN_HEADER = 'access-control-allow-origin';
const ALLOW_CREDENTIALS_HEADER = 'access-control-allow-credentials';

/**
 * Firefox extension pages issue an ordinary cross-origin request — preflight
 * included — where Chromium bypasses CORS entirely on a host permission. The
 * sidebar loaded nothing at all on Firefox until the API answered these.
 */
test.group('API CORS policy', () => {
	test('should allow an extension origin to preflight an API route', async ({
		client,
		assert,
	}) => {
		const response = await client
			.options('/api/v1/collections')
			.header('Origin', FIREFOX_ORIGIN)
			.header('Access-Control-Request-Method', 'GET')
			.header('Access-Control-Request-Headers', 'authorization');

		assert.equal(response.headers()[ALLOW_ORIGIN_HEADER], FIREFOX_ORIGIN);
	});

	test('should never allow credentials, so no session cookie can ride along', async ({
		client,
		assert,
	}) => {
		const response = await client
			.options('/api/v1/collections')
			.header('Origin', FIREFOX_ORIGIN)
			.header('Access-Control-Request-Method', 'GET');

		assert.isUndefined(response.headers()[ALLOW_CREDENTIALS_HEADER]);
	});

	test('should refuse an ordinary web origin on an API route', async ({
		client,
		assert,
	}) => {
		const response = await client
			.options('/api/v1/collections')
			.header('Origin', 'https://evil.com')
			.header('Access-Control-Request-Method', 'GET');

		assert.isUndefined(response.headers()[ALLOW_ORIGIN_HEADER]);
	});

	test('should refuse an extension origin outside the API', async ({
		client,
		assert,
	}) => {
		const response = await client
			.options('/')
			.header('Origin', FIREFOX_ORIGIN)
			.header('Access-Control-Request-Method', 'GET');

		assert.isUndefined(response.headers()[ALLOW_ORIGIN_HEADER]);
	});
});
