import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import AuthEvent from '#models/auth_event';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import VerifyUserEmail from '#commands/verify_user_email';
import { captureConsoleOutput } from '#tests/helpers/console';
import { createUser, verifyUserEmail } from '#tests/factories/user_factory';

async function runVerifyUserEmail(email: string) {
	const command = await ace.create(VerifyUserEmail, [email]);

	await command.exec();

	return command;
}

test.group('user:verify-email', (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should mark an unconfirmed address as confirmed', async ({
		assert,
	}) => {
		const account = await createUser();

		const command = await runVerifyUserEmail(account.email);

		command.assertSucceeded();
		await account.refresh();
		assert.isNotNull(account.emailVerifiedAt);
	});

	test('should journal the confirmation', async ({ assert }) => {
		const account = await createUser();

		await runVerifyUserEmail(account.email);

		const event = await AuthEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.EMAIL_VERIFIED)
			.first();
		assert.isNotNull(event);
	});

	/**
	 * Running it twice is what an operator scripting a recovery does, so the
	 * second run reports rather than fails — and leaves the date it found
	 * alone, because that date is when the address was actually confirmed.
	 */
	test('should leave an already confirmed address untouched', async ({
		assert,
	}) => {
		const account = await verifyUserEmail(await createUser());
		const confirmedAt = account.emailVerifiedAt;

		const command = await runVerifyUserEmail(account.email);

		command.assertSucceeded();
		await account.refresh();
		assert.deepEqual(account.emailVerifiedAt, confirmedAt);
	});

	test('should journal nothing when there was nothing to confirm', async ({
		assert,
	}) => {
		const account = await verifyUserEmail(await createUser());

		await runVerifyUserEmail(account.email);

		const events = await AuthEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.EMAIL_VERIFIED);
		assert.isEmpty(events);
	});

	test('should refuse an address no account answers to', async () => {
		const command = await runVerifyUserEmail('nobody@example.com');

		command.assertFailed();
	});
});
