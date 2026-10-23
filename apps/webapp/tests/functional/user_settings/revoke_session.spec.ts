import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';

import UserSession from '#models/user_session';
import { createUser } from '#tests/factories/user_factory';
import { createUserSession } from '#tests/factories/user_session_factory';
import UserSessionTransformer from '#transformers/user_session_transformer';

const SESSIONS_ROUTE = '/user/sessions';
const UNKNOWN_PUBLIC_ID = '00000000-0000-4000-8000-000000000000';

test.group('Revoke session', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should delete the session identified by its public id', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-session' });
		const otherSession = await createUserSession(user);

		await client
			.delete(`${SESSIONS_ROUTE}/${otherSession.publicId}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		assert.isNull(await UserSession.find(otherSession.id));
	});

	test('should keep a session when it is addressed by its raw store id', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-session-raw-id' });
		const otherSession = await createUserSession(user);

		await client
			.delete(`${SESSIONS_ROUTE}/${otherSession.id}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		assert.isNotNull(await UserSession.find(otherSession.id));
	});

	test('should keep the session of another account', async ({
		assert,
		client,
	}) => {
		const attacker = await createUser({
			emailPrefix: 'revoke-session-attacker',
		});
		const victim = await createUser({ emailPrefix: 'revoke-session-victim' });
		const victimSession = await createUserSession(victim);

		await client
			.delete(`${SESSIONS_ROUTE}/${victimSession.publicId}`)
			.withCsrfToken()
			.loginAs(attacker)
			.redirects(0);

		assert.isNotNull(await UserSession.find(victimSession.id));
	});

	test('should leave sessions untouched when the public id is unknown', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-session-unknown' });
		const otherSession = await createUserSession(user);

		await client
			.delete(`${SESSIONS_ROUTE}/${UNKNOWN_PUBLIC_ID}`)
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		assert.isNotNull(await UserSession.find(otherSession.id));
	});

	test('should give every stored session its own public id distinct from the store id', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-session-ids' });
		const firstSession = await createUserSession(user);
		const secondSession = await createUserSession(user);

		assert.notEqual(firstSession.publicId, secondSession.publicId);
		assert.notEqual(firstSession.publicId, firstSession.id);
	});

	test('should expose the public id and never the store id in the settings payload', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'revoke-session-payload' });
		const storedSession = await createUserSession(user);

		const serialized = new UserSessionTransformer(
			storedSession,
			'current-store-id'
		).toObject();

		assert.equal(serialized.publicId, storedSession.publicId);
		assert.notInclude(JSON.stringify(serialized), storedSession.id);
	});
});
