import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { ACCOUNT_ROLE } from '#constants/account';
import { createUser } from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';
import SetUserRole, { ROLE_PROMPT } from '#commands/set_user_role';

const ADMINISTRATOR_CHOICE_INDEX = 0;

async function createAdministrator(): Promise<User> {
	const administrator = await createUser();
	administrator.isAdmin = true;

	return administrator.save();
}

async function runSetUserRole(email: string, role: string) {
	const command = await ace.create(SetUserRole, [email, `--role=${role}`]);

	await command.exec();

	return command;
}

test.group('user:set-role', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should promote a member to administrator', async ({ assert }) => {
		const account = await createUser();

		const command = await runSetUserRole(
			account.email,
			ACCOUNT_ROLE.ADMINISTRATOR
		);

		command.assertSucceeded();
		await account.refresh();
		assert.isTrue(account.isAdmin);
	});

	test('should demote an administrator to member', async ({ assert }) => {
		await createAdministrator();
		const administrator = await createAdministrator();

		const command = await runSetUserRole(
			administrator.email,
			ACCOUNT_ROLE.MEMBER
		);

		command.assertSucceeded();
		await administrator.refresh();
		assert.isFalse(administrator.isAdmin);
	});

	test('should prompt for the role when no flag was given', async ({
		assert,
	}) => {
		const account = await createUser();
		const command = await ace.create(SetUserRole, [account.email]);

		command.prompt.trap(ROLE_PROMPT).chooseOption(ADMINISTRATOR_CHOICE_INDEX);

		await command.exec();

		await account.refresh();
		assert.isTrue(account.isAdmin);
	});

	/**
	 * An instance with no administrator left has no way to reach its own admin
	 * pages, and nothing in the interface can hand the role back. The guard is
	 * the same shape as the one standing in front of the last sign-in method.
	 */
	test('should refuse to demote the last administrator', async ({ assert }) => {
		await User.query().update({ is_admin: false });
		const administrator = await createAdministrator();

		const command = await runSetUserRole(
			administrator.email,
			ACCOUNT_ROLE.MEMBER
		);

		command.assertFailed();
		await administrator.refresh();
		assert.isTrue(administrator.isAdmin);
	});

	test('should refuse a role this instance does not have', async ({
		assert,
	}) => {
		const account = await createUser();

		const command = await runSetUserRole(account.email, 'superuser');

		command.assertFailed();
		await account.refresh();
		assert.isFalse(account.isAdmin);
	});

	test('should refuse an address no account answers to', async () => {
		const command = await runSetUserRole(
			'nobody@example.com',
			ACCOUNT_ROLE.ADMINISTRATOR
		);

		command.assertFailed();
	});
});
