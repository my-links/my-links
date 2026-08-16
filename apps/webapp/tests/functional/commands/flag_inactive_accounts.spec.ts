import { DateTime } from 'luxon';
import { test } from '@japa/runner';
import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import { captureConsoleOutput } from '#tests/helpers/console';
import FlagInactiveAccounts from '#commands/flag_inactive_accounts';
import { ACCOUNT_INACTIVITY_THRESHOLD_DAYS } from '#constants/account';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import AccountDeletionRequestedNotification from '#mails/account_deletion_requested_notification';
import {
	createUser,
	markLastSeen,
	requestAccountDeletion,
} from '#tests/factories/user_factory';

const STALE_CUTOFF = DateTime.now().minus({
	days: ACCOUNT_INACTIVITY_THRESHOLD_DAYS + 1,
});
const FRESH_CUTOFF = DateTime.now().minus({
	days: ACCOUNT_INACTIVITY_THRESHOLD_DAYS - 1,
});

async function createAdmin(prefix = 'admin'): Promise<User> {
	const user = await createUser({ emailPrefix: prefix });
	user.isAdmin = true;
	await user.save();

	return user;
}

/**
 * A never-signed-in account: `createUser` already leaves `lastSeenAt` unset,
 * so only registration itself needs backdating.
 */
async function backdateRegistration(
	user: User,
	createdAt: DateTime
): Promise<User> {
	user.createdAt = createdAt;

	return user.save();
}

async function runFlagInactiveAccounts() {
	const command = await ace.create(FlagInactiveAccounts, []);
	await command.exec();

	return command;
}

test.group('account:flag-inactive', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);
	group.each.setup(enableOutgoingMail);

	test('should flag an account whose last activity is past the threshold', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inactive-stale' });
		await markLastSeen(user, STALE_CUTOFF);

		const command = await runFlagInactiveAccounts();

		command.assertSucceeded();
		await user.refresh();
		assert.isNotNull(user.pendingDeletionAt);
	});

	test('should flag an account that was never signed into, based on when it registered', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inactive-never-seen' });
		await backdateRegistration(user, STALE_CUTOFF);

		await runFlagInactiveAccounts();

		await user.refresh();
		assert.isNotNull(user.pendingDeletionAt);
	});

	test('should leave an account seen within the threshold untouched', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inactive-fresh' });
		await markLastSeen(user, FRESH_CUTOFF);

		await runFlagInactiveAccounts();

		await user.refresh();
		assert.isNull(user.pendingDeletionAt);
	});

	test('should not re-flag an account already pending deletion', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'inactive-already-pending' });
		await markLastSeen(user, STALE_CUTOFF);
		const alreadyPendingSince = STALE_CUTOFF;
		await requestAccountDeletion(user, alreadyPendingSince);

		await runFlagInactiveAccounts();

		await user.refresh();
		assert.equal(user.pendingDeletionAt?.toISO(), alreadyPendingSince.toISO());
	});

	test('should not flag an administrator account', async ({ assert }) => {
		const administrator = await createAdmin('inactive-admin');
		await markLastSeen(administrator, STALE_CUTOFF);

		await runFlagInactiveAccounts();

		await administrator.refresh();
		assert.isNull(administrator.pendingDeletionAt);
	});

	test('should queue the confirmation mail for a flagged account', async () => {
		const user = await createUser({ emailPrefix: 'inactive-mail' });
		await markLastSeen(user, STALE_CUTOFF);

		await runFlagInactiveAccounts();

		queuedMails().assertQueued(AccountDeletionRequestedNotification, (mail) =>
			mail.message.hasTo(user.email)
		);
	});
});
