import { test } from '@japa/runner';
import app from '@adonisjs/core/services/app';
import type { ApiClient } from '@japa/api-client';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { UserService } from '#services/user/user_service';
import { countQueries } from '#tests/helpers/query_counter';
import { inertiaPageProps } from '#tests/helpers/inertia_page';
import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import { recordAuthEvent } from '#tests/factories/auth_event_factory';
import {
	createUser,
	linkOauthIdentity,
	setUserPassword,
	verifyUserEmail,
} from '#tests/factories/user_factory';

const ADMIN_DASHBOARD_ROUTE = '/admin';
const PASSWORD = 'correct-horse-battery-staple';
const ACCOUNTS_IN_LARGER_SAMPLE = 5;

type DashboardAccount = {
	readonly id: number;
	readonly email: string;
	readonly emailVerifiedAt: string | null;
	readonly authMethods: string[];
	readonly lastLoginAt: string | null;
};

async function createAdmin(): Promise<User> {
	const user = await createUser({ emailPrefix: 'admin' });
	user.isAdmin = true;
	await user.save();

	return user;
}

async function readDashboardAccounts(
	client: ApiClient,
	administrator: User
): Promise<DashboardAccount[]> {
	const response = await client
		.get(ADMIN_DASHBOARD_ROUTE)
		.withInertia()
		.loginAs(administrator);

	response.assertStatus(200);

	return inertiaPageProps(response).users;
}

function findAccount(
	accounts: DashboardAccount[],
	user: User
): DashboardAccount {
	const account = accounts.find((candidate) => candidate.id === user.id);
	if (!account) throw new Error(`account ${user.email} is missing`);

	return account;
}

test.group('Admin dashboard — account authentication info', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test('should say whether an address was ever confirmed', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const confirmed = await createUser({ emailPrefix: 'confirmed' });
		await verifyUserEmail(confirmed);
		const unconfirmed = await createUser({ emailPrefix: 'unconfirmed' });

		const accounts = await readDashboardAccounts(client, administrator);

		assert.isNotNull(findAccount(accounts, confirmed).emailVerifiedAt);
		assert.isNull(findAccount(accounts, unconfirmed).emailVerifiedAt);
	});

	test('should list every way an account can sign in', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'both-methods' });
		await setUserPassword(account, PASSWORD);
		await linkOauthIdentity(account, 'google-both-methods');

		const accounts = await readDashboardAccounts(client, administrator);

		assert.sameMembers(findAccount(accounts, account).authMethods, [
			'password',
			AUTH_PROVIDER.GOOGLE,
		]);
	});

	test('should leave the sign-in methods empty for an account with none', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'no-method' });

		const accounts = await readDashboardAccounts(client, administrator);

		assert.isEmpty(findAccount(accounts, account).authMethods);
	});

	test('should report the last successful sign-in of an account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'signed-in' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_SUCCEEDED,
		});

		const accounts = await readDashboardAccounts(client, administrator);

		assert.isNotNull(findAccount(accounts, account).lastLoginAt);
	});

	test('should ignore a failed attempt when reporting the last sign-in', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin();
		const account = await createUser({ emailPrefix: 'never-signed-in' });
		await recordAuthEvent({
			user: account,
			type: AUTH_EVENT_TYPE.LOGIN_FAILED,
		});

		const accounts = await readDashboardAccounts(client, administrator);

		assert.isNull(findAccount(accounts, account).lastLoginAt);
	});

	test('should cost the same number of queries whatever the number of accounts', async ({
		assert,
	}) => {
		const userService = await app.container.make(UserService);
		await createUser({ emailPrefix: 'overview-first' });

		const forOneAccount = await countQueries(() =>
			userService.getAccountsOverview()
		);

		for (let index = 0; index < ACCOUNTS_IN_LARGER_SAMPLE; index += 1) {
			const account = await createUser({ emailPrefix: `overview-${index}` });
			await setUserPassword(account, PASSWORD);
			await linkOauthIdentity(account, `google-overview-${index}`);
		}

		const forManyAccounts = await countQueries(() =>
			userService.getAccountsOverview()
		);

		// Guards against the equality above passing on two zeroes, which is what
		// a listener attached to the wrong client would produce.
		assert.isAbove(forOneAccount, 0);
		assert.equal(forManyAccounts, forOneAccount);
	});
});
