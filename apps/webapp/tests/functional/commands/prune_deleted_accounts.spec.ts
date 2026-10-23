import ace from '@adonisjs/core/services/ace';
import testUtils from '@adonisjs/core/services/test_utils';
import { test } from '@japa/runner';
import { DateTime } from 'luxon';

import PruneDeletedAccounts from '#commands/prune_deleted_accounts';
import { ACCOUNT_DELETION_GRACE_PERIOD_DAYS } from '#constants/account';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import AuditEvent from '#models/audit_event';
import User from '#models/user';
import {
	createUser,
	requestAccountDeletion,
} from '#tests/factories/user_factory';
import { captureConsoleOutput } from '#tests/helpers/console';

async function runPruneDeletedAccounts() {
	const command = await ace.create(PruneDeletedAccounts, []);
	await command.exec();

	return command;
}

test.group('account:prune-deleted', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(captureConsoleOutput);

	test('should wipe an account past the grace period', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'prune-expired' });
		await requestAccountDeletion(
			user,
			DateTime.now().minus({ days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS + 1 })
		);

		const command = await runPruneDeletedAccounts();

		command.assertSucceeded();
		assert.isNull(await User.find(user.id));
	});

	test('should journal the wipe with no actor', async ({ assert }) => {
		const user = await createUser({ emailPrefix: 'prune-expired-journal' });
		const userId = user.id;
		await requestAccountDeletion(
			user,
			DateTime.now().minus({ days: ACCOUNT_DELETION_GRACE_PERIOD_DAYS + 1 })
		);

		await runPruneDeletedAccounts();

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', userId)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DATA_WIPED)
			.firstOrFail();

		assert.isNull(event.actorId);
	});

	test('should leave an account still inside the grace period untouched', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-fresh' });
		await requestAccountDeletion(user);

		await runPruneDeletedAccounts();

		assert.isNotNull(await User.find(user.id));
	});

	test('should leave an account with no pending deletion untouched', async ({
		assert,
	}) => {
		const user = await createUser({ emailPrefix: 'prune-active' });

		await runPruneDeletedAccounts();

		assert.isNotNull(await User.find(user.id));
	});
});
