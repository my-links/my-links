import { test } from '@japa/runner';
import testUtils from '@adonisjs/core/services/test_utils';

import User from '#models/user';
import AuditEvent from '#models/audit_event';
import UserSession from '#models/user_session';
import { AUDIT_SUBJECT_TYPE } from '#constants/audit';
import { ACTIVITY_EVENT_TYPE } from '#constants/activity';
import { createUser } from '#tests/factories/user_factory';
import { createUserSession } from '#tests/factories/user_session_factory';
import { enableOutgoingMail, queuedMails } from '#tests/helpers/outgoing_mail';
import AccountDeletionRequestedNotification from '#mails/account_deletion_requested_notification';

async function createAdmin(prefix = 'admin'): Promise<User> {
	const user = await createUser({ emailPrefix: prefix });
	user.isAdmin = true;
	await user.save();

	return user;
}

test.group('Account deletion — self service', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should disable the account instead of wiping it outright', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-self' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const stillExists = await User.find(user.id);
		assert.isNotNull(stillExists);
		assert.isNotNull(stillExists?.pendingDeletionAt);
	});

	test('should journal the deletion request with no actor', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-journal' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', user.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DELETION_REQUESTED)
			.firstOrFail();

		assert.isNull(event.actorId);
	});

	test('should queue a confirmation mail', async ({ client }) => {
		const user = await createUser({ emailPrefix: 'disable-mail' });

		await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		queuedMails().assertQueued(AccountDeletionRequestedNotification, (mail) =>
			mail.message.hasTo(user.email)
		);
	});

	test('should revoke every other session and sign the requester out', async ({
		assert,
		client,
	}) => {
		const user = await createUser({ emailPrefix: 'disable-sessions' });
		const otherSession = await createUserSession(user);

		const response = await client
			.delete('/user/settings/account')
			.withCsrfToken()
			.loginAs(user)
			.redirects(0);

		const remainingSession = await UserSession.find(otherSession.id);
		assert.isNull(remainingSession);
		response.assertSessionMissing('auth_web');
	});
});

test.group('Account deletion — administrator bulk delete', (group) => {
	group.each.setup(() => testUtils.db().wrapInGlobalTransaction());
	group.each.setup(enableOutgoingMail);

	test('should disable target accounts instead of wiping them outright', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('disable-admin');
		const target = await createUser({ emailPrefix: 'disable-target' });

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const stillExists = await User.find(target.id);
		assert.isNotNull(stillExists);
		assert.isNotNull(stillExists?.pendingDeletionAt);
	});

	test('should journal the deletion request naming the administrator as actor', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('disable-admin-journal');
		const target = await createUser({ emailPrefix: 'disable-target-journal' });

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const event = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', target.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DELETION_REQUESTED)
			.firstOrFail();

		assert.equal(event.actorId, administrator.id);
	});

	test('should record which administrator requested it', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('disable-admin-recorded');
		const target = await createUser({ emailPrefix: 'disable-target-recorded' });

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await target.refresh();
		assert.equal(target.pendingDeletionRequestedById, administrator.id);
	});

	test('should revoke every session of the target account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('disable-admin-sessions');
		const target = await createUser({ emailPrefix: 'disable-target-sessions' });
		const targetSession = await createUserSession(target);

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		const remainingSession = await UserSession.find(targetSession.id);
		assert.isNull(remainingSession);
	});

	test('should not warn the target account by email', async ({ client }) => {
		const administrator = await createAdmin('disable-admin-mail');
		const target = await createUser({ emailPrefix: 'disable-target-mail' });

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [target.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		queuedMails().assertNotQueued(
			AccountDeletionRequestedNotification,
			(mail) => mail.message.hasTo(target.email)
		);
	});

	test('should neither disable nor journal an administrator account', async ({
		assert,
		client,
	}) => {
		const administrator = await createAdmin('wipe-admin-caller');
		const protectedAdmin = await createAdmin('wipe-admin-target');

		await client
			.post('/admin/users/bulk-delete')
			.json({ userIds: [protectedAdmin.id] })
			.withCsrfToken()
			.loginAs(administrator)
			.redirects(0);

		await protectedAdmin.refresh();
		assert.isNull(protectedAdmin.pendingDeletionAt);

		const events = await AuditEvent.query()
			.where('subjectType', AUDIT_SUBJECT_TYPE.ACCOUNT)
			.andWhere('subjectId', protectedAdmin.id)
			.andWhere('type', ACTIVITY_EVENT_TYPE.ACCOUNT_DELETION_REQUESTED);
		assert.lengthOf(events, 0);
	});
});
