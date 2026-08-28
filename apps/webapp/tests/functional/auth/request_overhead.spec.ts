import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { MailService } from '#services/mail/mail_service';
import { UserService } from '#services/user/user_service';
import { LAST_SEEN_AT_WRITE_THROTTLE_MINUTES } from '#constants/account';
import { createUser, markLastSeen } from '#tests/factories/user_factory';
import { AccountAccessService } from '#services/auth/account_access_service';
import { ActivityEventService } from '#services/activity/activity_event_service';

const PROTECTED_ROUTE = '/collections/favorites';

/**
 * Counts calls so a spec can assert the skip without measuring query timing.
 */
class CountingUserService extends UserService {
	hasAnyAccountCallsCount = 0;

	override async hasAnyAccount(
		...args: Parameters<UserService['hasAnyAccount']>
	): Promise<boolean> {
		this.hasAnyAccountCallsCount += 1;
		return super.hasAnyAccount(...args);
	}
}

async function spyOnHasAnyAccount() {
	const spy = new CountingUserService(
		await app.container.make(ActivityEventService),
		await app.container.make(AccountAccessService),
		await app.container.make(MailService)
	);

	app.container.swap(UserService, async () => spy);

	return {
		spy,
		restore: () => app.container.restore(UserService),
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
