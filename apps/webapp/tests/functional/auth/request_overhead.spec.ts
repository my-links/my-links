import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { LAST_SEEN_AT_WRITE_THROTTLE_MINUTES } from '#constants/account';
import { createUser, markLastSeen } from '#tests/factories/user_factory';
import { AccountQueryService } from '#services/user/account_query_service';

const PROTECTED_ROUTE = '/collections/favorites';

/**
 * Counts calls so a spec can assert the skip without measuring query timing.
 */
class CountingAccountQueryService extends AccountQueryService {
	hasAnyAccountCallsCount = 0;

	override async hasAnyAccount(
		...args: Parameters<AccountQueryService['hasAnyAccount']>
	): Promise<boolean> {
		this.hasAnyAccountCallsCount += 1;
		return super.hasAnyAccount(...args);
	}
}

async function spyOnHasAnyAccount() {
	const spy = new CountingAccountQueryService();

	app.container.swap(AccountQueryService, async () => spy);

	return {
		spy,
		restore: () => app.container.restore(AccountQueryService),
	};
}

test.group('Request overhead — last seen throttle', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should stamp lastSeenAt on the first request from a never-seen account', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'never-seen' });
		assert.notExists(user.lastSeenAt);

		await client.get(PROTECTED_ROUTE).loginAs(user).redirects(0);

		const refreshedUser = await User.findOrFail(user.id);
		assert.isNotNull(refreshedUser.lastSeenAt);
	});

	test('should not rewrite lastSeenAt on a request inside the throttle window', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'recently-seen' });
		await markLastSeen(user, DateTime.local());
		const lastSeenBefore = user.lastSeenAt;

		await client.get(PROTECTED_ROUTE).loginAs(user).redirects(0);

		const refreshedUser = await User.findOrFail(user.id);
		assert.isTrue(refreshedUser.lastSeenAt?.equals(lastSeenBefore as DateTime));
	});

	test('should rewrite lastSeenAt once the throttle window has passed', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'stale-seen' });
		const staleLastSeenAt = DateTime.local().minus({
			minutes: LAST_SEEN_AT_WRITE_THROTTLE_MINUTES + 1,
		});
		await markLastSeen(user, staleLastSeenAt);

		await client.get(PROTECTED_ROUTE).loginAs(user).redirects(0);

		const refreshedUser = await User.findOrFail(user.id);
		assert.isFalse(refreshedUser.lastSeenAt?.equals(staleLastSeenAt));
	});
});

test.group('Request overhead — registration policy check', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());

	test('should skip hasAnyAccount() when the visitor is already signed in', async ({
		assert,
		client,
	}) => {
		const { spy, restore } = await spyOnHasAnyAccount();
		const user = await createUser({ emailPrefix: 'signed-in' });

		await client.get(PROTECTED_ROUTE).loginAs(user).redirects(0);

		assert.equal(spy.hasAnyAccountCallsCount, 0);
		restore();
	});

	test('should still run hasAnyAccount() for a guest', async ({
		assert,
		client,
	}) => {
		const { spy, restore } = await spyOnHasAnyAccount();

		await client.get('/login').withInertia();

		assert.isAbove(spy.hasAnyAccountCallsCount, 0);
		restore();
	});
});
