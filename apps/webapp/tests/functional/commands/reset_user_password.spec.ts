import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import hash from '@adonisjs/core/services/hash';
import type { BaseCommand } from '@adonisjs/core/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import AuditEvent from '#models/audit_event';
import UserSession from '#models/user_session';
import PasswordAuth from '#models/password_auth';
import OneTimeToken from '#models/one_time_token';
import { EMAIL_PROMPT } from '#commands/_account_command';
import { captureConsoleOutput } from '#tests/helpers/console';
import { AUTH_EVENT_TYPE, ONE_TIME_TOKEN_TYPE } from '#constants/auth';
import { createUserSession } from '#tests/factories/user_session_factory';
import { createUser, setUserPassword } from '#tests/factories/user_factory';
import ResetUserPassword, {
	NEW_PASSWORD_CONFIRMATION_PROMPT,
	NEW_PASSWORD_PROMPT,
} from '#commands/reset_user_password';

const CURRENT_PASSWORD = 'correct-horse-battery-staple';
const NEW_PASSWORD = 'a-brand-new-passphrase';
const TOO_SHORT_PASSWORD = 'short';
const RESET_PATH = '/reset-password/';

function renderedOutput(command: BaseCommand): string {
	return command.logger
		.getLogs()
		.map((log) => log.message)
		.join('\n');
}

type PasswordRun = {
	readonly email: string;
	readonly password?: string;
	readonly passwordConfirmation?: string;
};

async function runPasswordReset({
	email,
	password = NEW_PASSWORD,
	passwordConfirmation = password,
}: PasswordRun) {
	const command = await ace.create(ResetUserPassword, [email]);

	command.prompt.trap(NEW_PASSWORD_PROMPT).replyWith(password);
	command.prompt
		.trap(NEW_PASSWORD_CONFIRMATION_PROMPT)
		.replyWith(passwordConfirmation);

	await command.exec();

	return command;
}

async function runLinkIssuance(email: string) {
	const command = await ace.create(ResetUserPassword, [email, '--link']);

	await command.exec();

	return command;
}

test.group('user:reset-password — writing a password', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should replace the password of the account', async ({ assert }) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);

		const command = await runPasswordReset({ email: account.email });

		command.assertSucceeded();
		const passwordAuth = await PasswordAuth.findByOrFail('userId', account.id);
		assert.isTrue(await hash.verify(passwordAuth.password, NEW_PASSWORD));
	});

	test('should give a password to an account that had none', async ({
		assert,
	}) => {
		const account = await createUser();

		const command = await runPasswordReset({ email: account.email });

		command.assertSucceeded();
		assert.isNotNull(await PasswordAuth.findBy('userId', account.id));
	});

	test('should revoke every session the old password reached', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);
		await createUserSession(account);

		await runPasswordReset({ email: account.email });

		const sessions = await UserSession.query().where(
			'userId',
			String(account.id)
		);
		assert.isEmpty(sessions);
	});

	test('should retire the reset links that were still in flight', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);
		await runLinkIssuance(account.email);

		await runPasswordReset({ email: account.email });

		const outstandingTokens = await OneTimeToken.query()
			.where('userId', account.id)
			.andWhere('type', ONE_TIME_TOKEN_TYPE.PASSWORD_RESET)
			.whereNull('consumedAt');
		assert.isEmpty(outstandingTokens);
	});

	test('should journal the change', async ({ assert }) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);

		await runPasswordReset({ email: account.email });

		const event = await AuditEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.PASSWORD_CHANGED)
			.first();
		assert.isNotNull(event);
	});

	test('should refuse a password shorter than the policy', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);

		const command = await runPasswordReset({
			email: account.email,
			password: TOO_SHORT_PASSWORD,
		});

		command.assertFailed();
		const passwordAuth = await PasswordAuth.findByOrFail('userId', account.id);
		assert.isTrue(await hash.verify(passwordAuth.password, CURRENT_PASSWORD));
	});

	test('should refuse a confirmation that does not match', async () => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);

		const command = await runPasswordReset({
			email: account.email,
			passwordConfirmation: 'something-else-entirely',
		});

		command.assertFailed();
	});

	test('should refuse an address no account answers to', async () => {
		const command = await ace.create(ResetUserPassword, ['nobody@example.com']);

		await command.exec();

		command.assertFailed();
	});

	test('should prompt for the address when none was given', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, CURRENT_PASSWORD);
		const command = await ace.create(ResetUserPassword, ['--link']);

		command.prompt.trap(EMAIL_PROMPT).replyWith(account.email);

		await command.exec();

		command.assertSucceeded();
		assert.include(renderedOutput(command), RESET_PATH);
	});
});

/**
 * The printed link is what an instance with no outgoing mail has instead of a
 * reset email, so nothing here enables the mailer.
 */
test.group('user:reset-password — printing a link', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should print a redeemable link', async ({ assert }) => {
		const account = await createUser();

		const command = await runLinkIssuance(account.email);

		command.assertSucceeded();
		assert.include(renderedOutput(command), RESET_PATH);
	});

	test('should store the link as a reset token of the account', async ({
		assert,
	}) => {
		const account = await createUser();

		await runLinkIssuance(account.email);

		const token = await OneTimeToken.query()
			.where('userId', account.id)
			.andWhere('type', ONE_TIME_TOKEN_TYPE.PASSWORD_RESET)
			.whereNull('consumedAt')
			.first();
		assert.isNotNull(token);
	});

	test('should retire the previous link when issuing a new one', async ({
		assert,
	}) => {
		const account = await createUser();
		await runLinkIssuance(account.email);

		await runLinkIssuance(account.email);

		const outstandingTokens = await OneTimeToken.query()
			.where('userId', account.id)
			.andWhere('type', ONE_TIME_TOKEN_TYPE.PASSWORD_RESET)
			.whereNull('consumedAt');
		assert.lengthOf(outstandingTokens, 1);
	});
});
