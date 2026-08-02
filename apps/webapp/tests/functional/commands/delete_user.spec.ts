import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { createUser } from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';
import DeleteUser, {
	DELETION_CONFIRMATION_PROMPT,
} from '#commands/delete_user';

async function runDeleteUser(email: string, retypedEmail: string) {
	const command = await ace.create(DeleteUser, [email]);

	command.prompt.trap(DELETION_CONFIRMATION_PROMPT).replyWith(retypedEmail);

	await command.exec();

	return command;
}

test.group('user:delete', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should delete the account once its address is retyped', async ({
		assert,
	}) => {
		const account = await createUser();

		const command = await runDeleteUser(account.email, account.email);

		command.assertSucceeded();
		assert.isNull(await User.find(account.id));
	});

	/**
	 * Retyping is the whole guard, so a near miss has to keep the account. It
	 * is also why the command has no flag to skip the prompt: deleting an
	 * account takes its links and its collections with it, and nothing here
	 * can undo that.
	 */
	test('should keep the account when the retyped address does not match', async ({
		assert,
	}) => {
		const account = await createUser();

		const command = await runDeleteUser(account.email, 'someone@example.com');

		command.assertFailed();
		assert.isNotNull(await User.find(account.id));
	});

	test('should refuse an address no account answers to', async () => {
		const command = await ace.create(DeleteUser, ['nobody@example.com']);

		await command.exec();

		command.assertFailed();
	});
});
