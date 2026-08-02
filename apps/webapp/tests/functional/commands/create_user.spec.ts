import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import hash from '@adonisjs/core/services/hash';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import PasswordAuth from '#models/password_auth';
import { AUTH_EVENT_TYPE } from '#constants/auth';
import { EMAIL_PROMPT } from '#commands/_account_command';
import { createUser } from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';
import CreateUser, {
	ADMINISTRATOR_PROMPT,
	DISPLAY_NAME_PROMPT,
	PASSWORD_CONFIRMATION_PROMPT,
	PASSWORD_PROMPT,
} from '#commands/create_user';

const ACCOUNT_NAME = 'Ada Lovelace';
const VALID_PASSWORD = 'correct-horse-battery-staple';
const TOO_SHORT_PASSWORD = 'short';

let accountCounter = 0;

function nextEmail(): string {
	accountCounter += 1;

	return `console-create-${Date.now()}-${accountCounter}@example.com`;
}

type CreationRun = {
	readonly email: string;
	readonly password?: string;
	readonly passwordConfirmation?: string;
	readonly grantsAdministrator?: boolean;
};

/**
 * Answers every prompt the nominal path asks. The email and the name travel as
 * CLI input so the spec exercises the "already provided" branch too.
 */
async function runCreateUser({
	email,
	password = VALID_PASSWORD,
	passwordConfirmation = password,
	grantsAdministrator = false,
}: CreationRun) {
	const command = await ace.create(CreateUser, [
		email,
		`--name=${ACCOUNT_NAME}`,
	]);

	command.prompt.trap(PASSWORD_PROMPT).replyWith(password);
	command.prompt
		.trap(PASSWORD_CONFIRMATION_PROMPT)
		.replyWith(passwordConfirmation);

	const administratorPrompt = command.prompt.trap(ADMINISTRATOR_PROMPT);
	if (grantsAdministrator) {
		administratorPrompt.accept();
	} else {
		administratorPrompt.reject();
	}

	await command.exec();

	return command;
}

/**
 * Registration closes on its own once an instance holds an account, so the
 * tests about a brand new instance have to start from an empty one. The delete
 * is safe because every group here runs inside a rolled back transaction.
 */
async function emptyInstance(): Promise<void> {
	await User.query().delete();
}

test.group('user:create', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should open an account for the address it was given', async ({
		assert,
	}) => {
		const email = nextEmail();

		const command = await runCreateUser({ email });

		command.assertSucceeded();
		assert.isNotNull(await User.findBy('email', email));
	});

	test('should prompt for the address when none was given', async ({
		assert,
	}) => {
		const email = nextEmail();
		const command = await ace.create(CreateUser, [`--name=${ACCOUNT_NAME}`]);

		command.prompt.trap(EMAIL_PROMPT).replyWith(email);
		command.prompt.trap(PASSWORD_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(PASSWORD_CONFIRMATION_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(ADMINISTRATOR_PROMPT).reject();

		await command.exec();

		command.assertSucceeded();
		assert.isNotNull(await User.findBy('email', email));
	});

	test('should prompt for the display name when none was given', async ({
		assert,
	}) => {
		const email = nextEmail();
		const command = await ace.create(CreateUser, [email]);

		command.prompt.trap(DISPLAY_NAME_PROMPT).replyWith(ACCOUNT_NAME);
		command.prompt.trap(PASSWORD_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(PASSWORD_CONFIRMATION_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(ADMINISTRATOR_PROMPT).reject();

		await command.exec();

		const account = await User.findByOrFail('email', email);
		assert.equal(account.name, ACCOUNT_NAME);
	});

	test('should attach the prompted password to the new account', async ({
		assert,
	}) => {
		const email = nextEmail();

		await runCreateUser({ email });

		const account = await User.findByOrFail('email', email);
		const passwordAuth = await PasswordAuth.findByOrFail('userId', account.id);
		assert.isTrue(await hash.verify(passwordAuth.password, VALID_PASSWORD));
	});

	test('should count the address as confirmed on the operator authority', async ({
		assert,
	}) => {
		const email = nextEmail();

		await runCreateUser({ email });

		const account = await User.findByOrFail('email', email);
		assert.isNotNull(account.emailVerifiedAt);
	});

	test('should grant administrator rights when the operator accepts', async ({
		assert,
	}) => {
		const email = nextEmail();

		await runCreateUser({ email, grantsAdministrator: true });

		const account = await User.findByOrFail('email', email);
		assert.isTrue(account.isAdmin);
	});

	test('should leave the account a plain member when the operator declines', async ({
		assert,
	}) => {
		const email = nextEmail();

		await runCreateUser({ email });

		const account = await User.findByOrFail('email', email);
		assert.isFalse(account.isAdmin);
	});

	test('should take the administrator answer from the flag without prompting', async ({
		assert,
	}) => {
		const email = nextEmail();
		const command = await ace.create(CreateUser, [
			email,
			`--name=${ACCOUNT_NAME}`,
			'--admin',
		]);

		command.prompt.trap(PASSWORD_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(PASSWORD_CONFIRMATION_PROMPT).replyWith(VALID_PASSWORD);

		await command.exec();

		const account = await User.findByOrFail('email', email);
		assert.isTrue(account.isAdmin);
	});

	test('should journal the creation', async ({ assert }) => {
		const email = nextEmail();

		await runCreateUser({ email });

		const account = await User.findByOrFail('email', email);
		const event = await AuditEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.REGISTERED)
			.first();
		assert.isNotNull(event);
	});

	test('should refuse an address that already has an account', async ({
		assert,
	}) => {
		const existingAccount = await createUser();
		const command = await ace.create(CreateUser, [
			existingAccount.email,
			`--name=${ACCOUNT_NAME}`,
		]);

		await command.exec();

		command.assertFailed();
		assert.lengthOf(
			await User.query().where('email', existingAccount.email),
			1
		);
	});

	test('should refuse a password shorter than the policy', async ({
		assert,
	}) => {
		const email = nextEmail();

		const command = await runCreateUser({
			email,
			password: TOO_SHORT_PASSWORD,
		});

		command.assertFailed();
		assert.isNull(await User.findBy('email', email));
	});

	test('should refuse a confirmation that does not match the password', async ({
		assert,
	}) => {
		const email = nextEmail();

		const command = await runCreateUser({
			email,
			passwordConfirmation: 'something-else-entirely',
		});

		command.assertFailed();
		assert.isNull(await User.findBy('email', email));
	});
});

test.group('user:create — the registration policy of the instance', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	/**
	 * The operator holds a shell on the machine. A policy meant to decide who
	 * may walk in from the outside has nothing to say about them, and a closed
	 * instance that could not add an account would have no way back in at all.
	 */
	test('should open an account even though registration is closed', async ({
		assert,
	}) => {
		await createUser();
		const email = nextEmail();

		const command = await runCreateUser({ email });

		command.assertSucceeded();
		assert.isNotNull(await User.findBy('email', email));
	});

	/**
	 * Trapped without a reply, the prompt answers with the default the command
	 * gave it — which is the very thing under test here.
	 */
	test('should default to administrator on an instance with no account yet', async ({
		assert,
	}) => {
		await emptyInstance();
		const email = nextEmail();
		const command = await ace.create(CreateUser, [
			email,
			`--name=${ACCOUNT_NAME}`,
		]);

		command.prompt.trap(PASSWORD_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(PASSWORD_CONFIRMATION_PROMPT).replyWith(VALID_PASSWORD);
		command.prompt.trap(ADMINISTRATOR_PROMPT);

		await command.exec();

		const account = await User.findByOrFail('email', email);
		assert.isTrue(account.isAdmin);
	});
});
