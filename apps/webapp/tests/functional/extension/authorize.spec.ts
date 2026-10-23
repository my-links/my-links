import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';

const AUTHORIZE_ROUTE = '/extension/authorize';
const OFFICIAL_EXTENSION_ID = 'agkmlplihacolkakgeccnbhphnepphma';
const VALID_REDIRECT_URI = `https://${OFFICIAL_EXTENSION_ID}.chromiumapp.org/`;
const NOT_ALLOWLISTED_REDIRECT_URI =
	'https://abcdefghijklmnopabcdefghijklmnop.chromiumapp.org/';

test.group('Extension authorize: consent page', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should redirect unauthenticated requests instead of exposing a token', async ({
		client,
		assert,
	}) => {
		const response = await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.redirects(0);

		assert.equal(response.response.status, 302);
	});

	test('should render the consent page for an allowlisted callback', async ({
		client,
	}) => {
		const user = await createUser();

		const response = await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.withInertia()
			.redirects(0)
			.loginAs(user);

		response.assertInertiaComponent('extension/authorize');
		response.assertInertiaPropsContains({ browser: 'chromium' });
	});

	test('should point cancel at the callback with an access_denied fragment', async ({
		client,
	}) => {
		const user = await createUser();

		const response = await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.withInertia()
			.redirects(0)
			.loginAs(user);

		response.assertInertiaPropsContains({
			cancelUrl: `${VALID_REDIRECT_URI}#error=access_denied`,
		});
	});

	test('should create no token when rendering the consent page', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: VALID_REDIRECT_URI })
			.withInertia()
			.redirects(0)
			.loginAs(user);

		assert.isEmpty(await User.accessTokens.all(user));
	});

	test('should refuse a redirect_uri outside the extension allowlist', async ({
		client,
	}) => {
		const user = await createUser();

		const response = await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: NOT_ALLOWLISTED_REDIRECT_URI })
			.redirects(0)
			.loginAs(user);

		response.assertStatus(400);
	});

	test('should refuse a redirect_uri that is not an extension callback', async ({
		client,
	}) => {
		const user = await createUser();

		const response = await client
			.get(AUTHORIZE_ROUTE)
			.qs({ redirect_uri: 'https://evil.example.com/steal' })
			.redirects(0)
			.loginAs(user);

		response.assertStatus(400);
	});
});

test.group('Extension authorize: token minting', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should create exactly one token on consent', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: VALID_REDIRECT_URI })
			.withCsrfToken()
			.redirects(0)
			.loginAs(user);

		assert.lengthOf(await User.accessTokens.all(user), 1);
	});

	test('should redirect to the callback with a token in the fragment', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		const response = await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: VALID_REDIRECT_URI })
			.withCsrfToken()
			.redirects(0)
			.loginAs(user);

		assert.equal(response.response.status, 302);
		const location = response.response.headers.location;
		assert.isTrue(location.startsWith(VALID_REDIRECT_URI));
		assert.match(location, /#token=.+/);
	});

	test('should force a full-page navigation when submitted through Inertia', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		const response = await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: VALID_REDIRECT_URI })
			.withCsrfToken()
			.withInertia()
			.redirects(0)
			.loginAs(user);

		assert.equal(response.response.status, 409);
		const inertiaLocation = response.response.headers['x-inertia-location'];
		assert.isTrue(inertiaLocation.startsWith(VALID_REDIRECT_URI));
		assert.match(inertiaLocation, /#token=.+/);
	});

	test('should refuse a non-allowlisted callback', async ({ client }) => {
		const user = await createUser();

		const response = await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: NOT_ALLOWLISTED_REDIRECT_URI })
			.withCsrfToken()
			.redirects(0)
			.loginAs(user);

		response.assertStatus(400);
	});

	test('should create no token for a non-allowlisted callback', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: NOT_ALLOWLISTED_REDIRECT_URI })
			.withCsrfToken()
			.redirects(0)
			.loginAs(user);

		assert.isEmpty(await User.accessTokens.all(user));
	});

	test('should create no token for a submission without a CSRF token', async ({
		client,
		assert,
	}) => {
		const user = await createUser();

		const response = await client
			.post(AUTHORIZE_ROUTE)
			.form({ redirect_uri: VALID_REDIRECT_URI })
			.redirects(0)
			.loginAs(user);

		assert.notMatch(response.response.headers.location ?? '', /#token=/);
		assert.isEmpty(await User.accessTokens.all(user));
	});
});
