import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

test.group('Security headers', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should set a restrictive CSP and deny framing on a rendered page', async ({
		client,
		assert,
	}) => {
		// Plain GET (no `.withInertia()`) so this goes through the same
		// full-page SSR render path a browser hits; that's where the
		// nonce has to line up with what shield put on the header.
		const response = await client.get('/login');

		response.assertStatus(200);
		response.assertHeader('x-frame-options', 'DENY');

		const csp = response.headers()['content-security-policy'];
		assert.isString(csp);
		assert.include(csp, "default-src 'self'");
		assert.include(csp, "frame-ancestors 'none'");
		assert.include(csp, "object-src 'none'");

		const nonceMatch = csp.match(/script-src[^;]*'nonce-([^']+)'/);
		assert.isNotNull(nonceMatch);

		const nonce = nonceMatch?.[1];
		assert.include(response.text(), `nonce="${nonce}"`);
	});

	// An unrouted URL never reaches the router middleware stack, so shield has
	// to run before it or the error page ships with no headers at all.
	test('should set the same headers on an error page', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/this-route-does-not-exist');

		response.assertStatus(404);
		response.assertHeader('x-frame-options', 'DENY');

		const csp = response.headers()['content-security-policy'];
		assert.isString(csp);
		assert.include(csp, "default-src 'self'");
		assert.include(csp, "frame-ancestors 'none'");

		const nonceMatch = csp.match(/script-src[^;]*'nonce-([^']+)'/);
		assert.isNotNull(nonceMatch);
		assert.include(response.text(), `nonce="${nonceMatch?.[1]}"`);
	});

	test('should send a same-origin referrer policy and a deny-all permissions policy on a rendered page', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/login');

		response.assertHeader('referrer-policy', 'same-origin');
		const permissionsPolicy = response.headers()['permissions-policy'];
		assert.include(permissionsPolicy, 'camera=()');
		assert.include(permissionsPolicy, 'microphone=()');
		assert.include(permissionsPolicy, 'geolocation=()');
		assert.include(permissionsPolicy, 'payment=()');
		assert.include(permissionsPolicy, 'usb=()');
		assert.include(permissionsPolicy, 'browsing-topics=()');
	});

	test('should send nosniff on a static file', async ({ client }) => {
		const response = await client.get('/favicon.ico');

		response.assertStatus(200);
		response.assertHeader('x-content-type-options', 'nosniff');
	});

	test('should deny framing on a static file', async ({ client }) => {
		const response = await client.get('/favicon.ico');

		response.assertHeader('x-frame-options', 'DENY');
	});

	test('should send the referrer policy on a static file', async ({
		client,
	}) => {
		const response = await client.get('/favicon.ico');

		response.assertHeader('referrer-policy', 'same-origin');
	});

	test('should send the shield HSTS max-age on a static file', async ({
		client,
	}) => {
		const response = await client.get('/favicon.ico');

		response.assertHeader('strict-transport-security', 'max-age=15552000');
	});

	test('should send the same policies on an API response', async ({
		client,
		assert,
	}) => {
		const response = await client.get('/api/v1/collections');

		response.assertStatus(401);
		response.assertHeader('referrer-policy', 'same-origin');
		assert.include(response.headers()['permissions-policy'], 'camera=()');
	});
});
