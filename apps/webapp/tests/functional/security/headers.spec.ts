import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

test.group('Security headers', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should set a restrictive CSP and deny framing on a rendered page', async ({
		client,
		assert,
	}) => {
		// Plain GET (no `.withInertia()`) so this goes through the same
		// full-page SSR render path a browser hits — that's where the
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
});
