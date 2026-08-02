import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import OauthAuth from '#models/oauth_auth';
import AuthEvent from '#models/auth_event';
import { captureConsoleOutput } from '#tests/helpers/console';
import { AUTH_EVENT_TYPE, AUTH_PROVIDER } from '#constants/auth';
import UnlinkUserProvider, {
	PROVIDER_PROMPT,
} from '#commands/unlink_user_provider';
import {
	createUser,
	linkOauthIdentity,
	setUserPassword,
} from '#tests/factories/user_factory';

const ACCOUNT_PASSWORD = 'correct-horse-battery-staple';
const ONLY_PROVIDER_CHOICE_INDEX = 0;

let identityCounter = 0;

function nextProviderUserId(): string {
	identityCounter += 1;

	return `console-unlink-${Date.now()}-${identityCounter}`;
}

async function runUnlink(email: string, provider: string) {
	const command = await ace.create(UnlinkUserProvider, [
		email,
		`--provider=${provider}`,
	]);

	await command.exec();

	return command;
}

test.group('user:unlink-provider', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should detach the provider from the account', async ({ assert }) => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);
		await linkOauthIdentity(account, nextProviderUserId());

		const command = await runUnlink(account.email, AUTH_PROVIDER.GOOGLE);

		command.assertSucceeded();
		assert.isEmpty(await OauthAuth.query().where('userId', account.id));
	});

	test('should journal the unlinking', async ({ assert }) => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);
		await linkOauthIdentity(account, nextProviderUserId());

		await runUnlink(account.email, AUTH_PROVIDER.GOOGLE);

		const event = await AuthEvent.query()
			.where('userId', account.id)
			.andWhere('type', AUTH_EVENT_TYPE.PROVIDER_UNLINKED)
			.first();
		assert.isNotNull(event);
	});

	/**
	 * The guard lives in `ProviderLinkService`, which is exactly why the
	 * command inherits it for free — the console is one more caller, not a way
	 * around the rule.
	 */
	test('should refuse to detach the only way into the account', async ({
		assert,
	}) => {
		const account = await createUser();
		await linkOauthIdentity(account, nextProviderUserId());

		const command = await runUnlink(account.email, AUTH_PROVIDER.GOOGLE);

		command.assertFailed();
		assert.lengthOf(await OauthAuth.query().where('userId', account.id), 1);
	});

	test('should refuse a provider the account is not linked to', async () => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);

		const command = await runUnlink(account.email, AUTH_PROVIDER.GOOGLE);

		command.assertFailed();
	});

	test('should refuse a provider this instance knows nothing about', async () => {
		const account = await createUser();

		const command = await runUnlink(account.email, 'facebook');

		command.assertFailed();
	});

	test('should prompt among the providers the account is linked to', async ({
		assert,
	}) => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);
		await linkOauthIdentity(account, nextProviderUserId());
		const command = await ace.create(UnlinkUserProvider, [account.email]);

		command.prompt
			.trap(PROVIDER_PROMPT)
			.chooseOption(ONLY_PROVIDER_CHOICE_INDEX);

		await command.exec();

		command.assertSucceeded();
		assert.isEmpty(await OauthAuth.query().where('userId', account.id));
	});

	test('should refuse an account with no linked provider at all', async () => {
		const account = await createUser();
		await setUserPassword(account, ACCOUNT_PASSWORD);
		const command = await ace.create(UnlinkUserProvider, [account.email]);

		await command.exec();

		command.assertFailed();
	});

	test('should refuse an address no account answers to', async () => {
		const command = await runUnlink('nobody@example.com', AUTH_PROVIDER.GOOGLE);

		command.assertFailed();
	});
});
