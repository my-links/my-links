import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import type { BaseCommand } from '@adonisjs/core/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { AUTH_PROVIDER } from '#constants/auth';
import { captureConsoleOutput } from '#tests/helpers/console';
import ListUsers, {
	NO_ACCOUNT_MESSAGE,
	NO_MATCHING_ACCOUNT_MESSAGE,
} from '#commands/list_users';
import {
	createUser,
	linkOauthIdentity,
	setUserPassword,
	verifyUserEmail,
} from '#tests/factories/user_factory';

const ACCOUNT_PASSWORD = 'correct-horse-battery-staple';

let identityCounter = 0;

function nextProviderUserId(): string {
	identityCounter += 1;

	return `console-list-${Date.now()}-${identityCounter}`;
}

function renderedOutput(command: BaseCommand): string {
	return command.logger
		.getLogs()
		.map((log) => log.message)
		.join('\n');
}

async function runListUsers(argv: string[] = []) {
	const command = await ace.create(ListUsers, argv);

	await command.exec();

	return command;
}

/**
 * The listing describes the whole instance, so a spec about who shows up has
 * to start from an instance holding only the accounts it created. The delete
 * is safe because every group here runs inside a rolled back transaction.
 */
async function emptyInstance(): Promise<void> {
	await User.query().delete();
}

test.group('user:list', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);
	group.each.setup(() => emptyInstance());

	test('should list every account by default', async ({ assert }) => {
		const account = await createUser();
		const otherAccount = await createUser();

		const command = await runListUsers();

		command.assertSucceeded();
		assert.include(renderedOutput(command), account.email);
		assert.include(renderedOutput(command), otherAccount.email);
	});

	test('should describe the role, the address and the sign-in methods of an account', async () => {
		const account = await createUser({ name: 'Ada Lovelace' });
		await verifyUserEmail(account);
		await setUserPassword(account, ACCOUNT_PASSWORD);

		const command = await runListUsers();

		command.assertTableRows([
			[account.email, 'Ada Lovelace', 'member', 'confirmed', 'password'],
		]);
	});

	test('should name every method an account can sign in with', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);
		await linkOauthIdentity(account, nextProviderUserId());

		const command = await runListUsers();

		assert.include(
			renderedOutput(command),
			`password, ${AUTH_PROVIDER.GOOGLE}`
		);
	});

	test('should keep only the administrators behind --admin', async ({
		assert,
	}) => {
		const administrator = await createUser();
		administrator.isAdmin = true;
		await administrator.save();
		const member = await createUser();

		const command = await runListUsers(['--admin']);

		assert.include(renderedOutput(command), administrator.email);
		assert.notInclude(renderedOutput(command), member.email);
	});

	test('should keep only the unconfirmed addresses behind --unverified', async ({
		assert,
	}) => {
		const unconfirmedAccount = await createUser();
		const confirmedAccount = await verifyUserEmail(await createUser());

		const command = await runListUsers(['--unverified']);

		assert.include(renderedOutput(command), unconfirmedAccount.email);
		assert.notInclude(renderedOutput(command), confirmedAccount.email);
	});

	test('should keep only the accounts linked to the named provider', async ({
		assert,
	}) => {
		const linkedAccount = await createUser();
		await linkOauthIdentity(linkedAccount, nextProviderUserId());
		const credentialsAccount = await createUser();
		await setUserPassword(credentialsAccount, ACCOUNT_PASSWORD);

		const command = await runListUsers([`--provider=${AUTH_PROVIDER.GOOGLE}`]);

		assert.include(renderedOutput(command), linkedAccount.email);
		assert.notInclude(renderedOutput(command), credentialsAccount.email);
	});

	test('should refuse a provider this instance knows nothing about', async () => {
		const command = await runListUsers(['--provider=facebook']);

		command.assertFailed();
	});

	test('should say an empty instance holds no account', async ({ assert }) => {
		const command = await runListUsers();

		assert.include(renderedOutput(command), NO_ACCOUNT_MESSAGE);
	});

	/**
	 * "This instance holds no account" would be a lie here, and the kind that
	 * sends an operator looking for accounts standing right behind a filter.
	 */
	test('should blame the filters rather than the instance when they match nothing', async ({
		assert,
	}) => {
		await createUser();

		const command = await runListUsers(['--admin']);

		assert.include(renderedOutput(command), NO_MATCHING_ACCOUNT_MESSAGE);
	});
});
